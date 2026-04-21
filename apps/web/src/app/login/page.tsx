'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/health', {
        method: 'GET',
      });
      setBackendStatus(response.ok ? 'online' : 'offline');
    } catch {
      setBackendStatus('offline');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      useAuthStore.getState().setTokens(data.access_token, data.refresh_token ?? '');
      
      // Fetch user profile to properly populate store and set isAuthenticated to true
      const userResp = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` }
      });
      if (!userResp.ok) {
        throw new Error('Failed to fetch user details');
      }
      const userData = await userResp.json();
      useAuthStore.getState().setUser(userData);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
        display: 'flex',
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* Left Side - Branding */}
      <div
        style={{
          display: 'none',
          width: '50%',
          background: 'linear-gradient(135deg, #2d8659 0%, #1f5c3d 100%)',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
          color: 'white',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginTop: 0, marginRight: 0, marginBottom: '16px', marginLeft: 0 }}>📊 DataFlow BI</h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', margin: 0 }}>Transform data into actionable insights</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '400px' }}>
          {[
            { title: 'Fast Data Import', desc: 'Upload and process data instantly' },
            { title: 'Smart Dashboards', desc: 'Create visualizations without code' },
            { title: 'Real-time Collaboration', desc: 'Share insights with your team' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#4ca569', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</div>
              <div>
                <h3 style={{ fontWeight: '600', marginTop: 0, marginRight: 0, marginBottom: '4px', marginLeft: 0 }}>{item.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', margin: 0 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginTop: 0, marginRight: 0, marginBottom: '8px', marginLeft: 0 }}>Welcome Back</h2>
            <p style={{ color: '#6b7280', margin: 0 }}>Sign in to your account to continue</p>
          </div>

          {/* Backend Status */}
          <div
            style={{
              marginBottom: '24px',
              padding: '16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: backendStatus === 'online' ? '#f0fdf4' : backendStatus === 'offline' ? '#fef2f2' : '#f9fafb',
              border: `1px solid ${backendStatus === 'online' ? '#dcfce7' : backendStatus === 'offline' ? '#fee2e2' : '#e5e7eb'}`,
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: backendStatus === 'online' ? '#22c55e' : backendStatus === 'offline' ? '#ef4444' : '#9ca3af',
              }}
            />
            <span style={{ fontSize: '14px', fontWeight: '500', color: backendStatus === 'online' ? '#166534' : backendStatus === 'offline' ? '#991b1b' : '#4b5563' }}>
              {backendStatus === 'online' && '✓ Backend is online'}
              {backendStatus === 'offline' && '✗ Backend is offline'}
              {backendStatus === 'checking' && '⏳ Checking connection...'}
            </span>
          </div>

          {error && (
            <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <p style={{ fontSize: '14px', color: '#991b1b', margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Email */}
            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1f2937', marginBottom: '8px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }}>✉️</span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '40px',
                    paddingRight: '16px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '2px solid #2d8659';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid #d1d5db';
                  }}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1f2937', marginBottom: '8px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }}>🔒</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '40px',
                    paddingRight: '40px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = '2px solid #2d8659';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = '1px solid #d1d5db';
                  }}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? '👁️‍🗨️' : '🔓'}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: isLoading ? '#9ca3af' : '#2d8659',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#1f5c3d';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 134, 89, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#2d8659';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {isLoading ? '🔄 Signing in...' : '→ Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div style={{ marginTop: '32px', padding: '24px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <h4 style={{ fontWeight: '600', color: '#1e3a8a', marginTop: 0, marginRight: 0, marginBottom: '8px', marginLeft: 0 }}>📝 Demo Credentials</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#1e40af' }}>
              <p style={{ margin: 0 }}><strong>Email:</strong> demo@example.com</p>
              <p style={{ margin: 0 }}><strong>Password:</strong> demo123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

