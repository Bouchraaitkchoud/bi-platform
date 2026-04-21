import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/stores/authStore';
import getAuthClient from '@/lib/apiClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user?: User;
}

// Login hook
export const useLogin = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const setTokens = useAuthStore((state) => state.setTokens);
  const setError = useAuthStore((state) => state.setError);

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/auth/login`,
        credentials
      );
      return response.data;
    },
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token);
      setError(null);
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Login failed';
      setError(message);
    },
  });
};

// Register hook
export const useRegister = () => {
  const setError = useAuthStore((state) => state.setError);

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/auth/register`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      setError(null);
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Registration failed';
      setError(message);
    },
  });
};

// Get current user
export const useCurrentUser = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const client = getAuthClient();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await client.get<User>('/auth/me');
      return response.data;
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Refresh token hook
export const useRefreshToken = () => {
  const setTokens = useAuthStore((state) => state.setTokens);

  return useMutation({
    mutationFn: async (refreshToken: string) => {
      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/auth/refresh`,
        { refresh_token: refreshToken }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token);
    },
  });
};

// Update profile hook
export const useUpdateProfile = () => {
  const client = getAuthClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await client.put<User>('/auth/me', data);
      return response.data;
    },
    onSuccess: (user) => {
      setUser(user);
    },
  });
};

// Logout
export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      const client = getAuthClient();
      await client.post('/auth/logout');
    },
    onSuccess: () => {
      logout();
    },
  });
};
