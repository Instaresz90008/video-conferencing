
import { DATABASE_CONFIG } from '@/config/database';
import { localAuthFallback } from '@/services/fallback/localAuth';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

class AuthService {
  private baseUrl = `http://localhost:4000/api/auth`;

  async login(email: string, password: string): Promise<AuthState> {
    try {
      // Primary: PostgreSQL backend authentication
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      
      // Store auth data
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_id', data.user.id);
      
      return {
        user: data.user,
        token: data.token,
        isAuthenticated: true
      };
    } catch (error) {
      console.error('Primary auth failed, using fallback:', error);
      // Fallback: Local authentication
      return localAuthFallback.login(email, password);
    }
  }

  async register(email: string, password: string, name: string): Promise<AuthState> {
    try {
      // Primary: PostgreSQL backend registration
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });

      if (!response.ok) throw new Error('Registration failed');

      const data = await response.json();
      
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_id', data.user.id);
      
      return {
        user: data.user,
        token: data.token,
        isAuthenticated: true
      };
    } catch (error) {
      console.error('Primary registration failed, using fallback:', error);
      return localAuthFallback.register(email, password, name);
    }
  }

  async logout(): Promise<void> {
    try {
      // Primary: PostgreSQL backend logout
      await fetch(`${this.baseUrl}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
    } catch (error) {
      console.error('Primary logout failed:', error);
    }

    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localAuthFallback.logout();
  }

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    try {
      // Primary: PostgreSQL backend user fetch
      const response = await fetch(`${this.baseUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch user');
      
      return await response.json();
    } catch (error) {
      console.error('Primary user fetch failed, using fallback:', error);
      return localAuthFallback.getCurrentUser();
    }
  }
}

export const authService = new AuthService();
