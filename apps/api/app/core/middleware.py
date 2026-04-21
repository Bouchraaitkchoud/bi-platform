# apps/api/app/core/middleware.py
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime, timedelta
from collections import defaultdict
import asyncio

# Rate limit configuration (100 requests per minute, 15 minute block)
REQUESTS_PER_MINUTE = 100
BLOCK_DURATION_MINUTES = 15


class RateLimitStore:
    """In-memory rate limit store (in production, use Redis)"""
    def __init__(self):
        self.requests: dict[str, list[datetime]] = defaultdict(list)
        self.blocked_ips: dict[str, datetime] = {}
        self._lock = asyncio.Lock()
    
    async def is_blocked(self, client_ip: str) -> bool:
        """Check if IP is blocked"""
        async with self._lock:
            if client_ip in self.blocked_ips:
                if datetime.utcnow() < self.blocked_ips[client_ip]:
                    return True
                else:
                    # Unblock if duration has passed
                    del self.blocked_ips[client_ip]
            return False
    
    async def check_rate_limit(self, client_ip: str) -> bool:
        """
        Check if request should be allowed.
        Returns: True if allowed, False if blocked
        Blocks for BLOCK_DURATION_MINUTES if limit exceeded
        """
        async with self._lock:
            now = datetime.utcnow()
            one_minute_ago = now - timedelta(minutes=1)
            
            # Clean old requests (older than 1 minute)
            self.requests[client_ip] = [
                req_time for req_time in self.requests[client_ip]
                if req_time > one_minute_ago
            ]
            
            # Check if at limit
            if len(self.requests[client_ip]) >= REQUESTS_PER_MINUTE:
                # Block this IP
                self.blocked_ips[client_ip] = now + timedelta(minutes=BLOCK_DURATION_MINUTES)
                return False
            
            # Add current request
            self.requests[client_ip].append(now)
            return True


# Global rate limit store
rate_limit_store = RateLimitStore()


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware (5 req/min, 15 min block)
    Applies to: API endpoints (not static files)
    """
    
    # Paths to skip rate limiting
    SKIP_PATHS = {"/docs", "/redoc", "/openapi.json", "/health", "/"}
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for non-API paths
        if request.url.path in self.SKIP_PATHS or not request.url.path.startswith("/api"):
            return await call_next(request)
        
        # Get client IP
        client_ip = request.client.host
        
        # Check if blocked
        if await rate_limit_store.is_blocked(client_ip):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Blocked for {BLOCK_DURATION_MINUTES} minutes."
            )
        
        # Check rate limit
        if not await rate_limit_store.check_rate_limit(client_ip):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Maximum {REQUESTS_PER_MINUTE} requests per minute. Blocked for {BLOCK_DURATION_MINUTES} minutes."
            )
        
        return await call_next(request)
