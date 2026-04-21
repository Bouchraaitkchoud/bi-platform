// AuthService now delegates to the Zustand authStore (persisted to localStorage
// under the key 'auth-storage') so that all services share the same token
// that the login flow saves via useAuthStore.setTokens().
import { useAuthStore } from '@/stores/authStore';

export class AuthService {
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return useAuthStore.getState().accessToken;
  }

  static getUser(): any {
    if (typeof window === 'undefined') return null;
    return useAuthStore.getState().user;
  }

  static getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return useAuthStore.getState().isAuthenticated;
  }

  static logout(): void {
    useAuthStore.getState().logout();
  }
}
