
// LOCAL FALLBACK - DELETE THIS FOLDER WHEN BACKEND IS READY
import { AuthState, User } from '@/services/authService';

class LocalAuthFallback {
  private users: Map<string, User & { password: string }> = new Map();

  constructor() {
    // Initialize with demo user
    this.users.set('demo@example.com', {
      id: 'demo-user-1',
      email: 'demo@example.com',
      name: 'Demo User',
      password: 'demo123',
      createdAt: new Date().toISOString()
    });
  }

  async login(email: string, password: string): Promise<AuthState> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    const user = this.users.get(email);
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = `mock_token_${Date.now()}`;
    
    return {
      user: userWithoutPassword,
      token,
      isAuthenticated: true
    };
  }

  async register(email: string, password: string, name: string): Promise<AuthState> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (this.users.has(email)) {
      throw new Error('User already exists');
    }

    const user: User & { password: string } = {
      id: `user_${Date.now()}`,
      email,
      name,
      password,
      createdAt: new Date().toISOString()
    };

    this.users.set(email, user);
    
    const { password: _, ...userWithoutPassword } = user;
    const token = `mock_token_${Date.now()}`;
    
    return {
      user: userWithoutPassword,
      token,
      isAuthenticated: true
    };
  }

  logout(): void {
    // Local logout logic
    console.log('Local fallback logout');
  }

  getCurrentUser(): User | null {
    // Return mock user if token exists
    const token = localStorage.getItem('auth_token');
    if (token && token.startsWith('mock_token_')) {
      return {
        id: 'demo-user-1',
        email: 'demo@example.com',
        name: 'Demo User',
        createdAt: new Date().toISOString()
      };
    }
    return null;
  }
}

export const localAuthFallback = new LocalAuthFallback();
