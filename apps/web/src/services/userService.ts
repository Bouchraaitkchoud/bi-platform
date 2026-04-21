import { apiClient } from './api';

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserResponse;
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: UserResponse;
  token: string;
}

/**
 * User Service - Handles user-related API calls
 */
export const userService = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return apiClient.post<RegisterResponse>('/auth/register', data);
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    return apiClient.post('/auth/logout');
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<UserResponse> {
    return apiClient.get<UserResponse>('/auth/me');
  },

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<UserResponse>): Promise<UserResponse> {
    return apiClient.put<UserResponse>('/users/profile', data);
  },

  /**
   * Change password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    return apiClient.post('/auth/change-password', { oldPassword, newPassword });
  },

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserResponse> {
    return apiClient.get<UserResponse>(`/users/${id}`);
  },

  /**
   * Get all users (admin only)
   */
  async getAllUsers(page: number = 1, limit: number = 20): Promise<any> {
    return apiClient.get(`/users?page=${page}&limit=${limit}`);
  },

  /**
   * Delete user (admin only)
   */
  async deleteUser(id: string): Promise<void> {
    return apiClient.delete(`/users/${id}`);
  },
};
