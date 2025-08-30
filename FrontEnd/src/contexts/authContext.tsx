// import { Card, CardContent } from '@/components/ui/card';
// import { AlertCircle } from 'lucide-react';
// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { Button } from 'react-day-picker';

// // Types
// export interface User {
//   id: string;
//   email: string;
//   name: string;
//   avatar?: string;
//   role?: string;
//   createdAt?: string;
//   // Add other user properties as needed
// }

// interface AuthContextType {
//   user: User | null;
//   isLoading: boolean;
//   isAuthenticated: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => Promise<void>;
//   register: (userData: RegisterData) => Promise<void>;
//   updateUser: (userData: Partial<User>) => void;
//   refreshAuth: () => Promise<void>;
// }

// interface RegisterData {
//   email: string;
//   password: string;
//   name: string;
//   confirmPassword?: string;
// }

// // Create context
// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // Custom hook to use auth context
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// // Auth provider component
// interface AuthProviderProps {
//   children: ReactNode;
// }

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   // Check if user is authenticated on app load
//   useEffect(() => {
//     checkAuthStatus();
//   }, []);

//   const checkAuthStatus = async () => {
//     try {
//       setIsLoading(true);
//       console.log("import data:",import.meta.env.VITE_SERVER_URL)
//       const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/me`, {
//         credentials: 'include',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         const userData = await response.json();
//         setUser(userData);
//       } else {
//         setUser(null);
//       }
//     } catch (error) {
//       console.error('Auth check failed:', error);
//       setUser(null);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const login = async (email: string, password: string): Promise<void> => {
//     setIsLoading(true);
//     try {
//       const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/login`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//         body: JSON.stringify({ email, password }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Invalid email or password');
//       }

//       const userData = await response.json();
//       setUser(userData);
//     } catch (error) {
//       setUser(null);
//       throw error; // Re-throw to handle in component
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const register = async (userData: RegisterData): Promise<void> => {
//     setIsLoading(true);
//     try {
//       const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/register`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//         body: JSON.stringify(userData),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Registration failed');
//       }

//       const newUser = await response.json();
//       setUser(newUser);
//     } catch (error) {
//       setUser(null);
//       throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const logout = async (): Promise<void> => {
//     try {
//       await fetch(`${import.meta.env.SERVER_URL}/api/auth/logout`, {
//         method: 'POST',
//         credentials: 'include',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
//     } catch (error) {
//       console.error('Logout request failed:', error);
//       // Continue with local logout even if request fails
//     } finally {
//       setUser(null);
//     }
//   };

//   const updateUser = (userData: Partial<User>) => {
//     setUser(prev => prev ? { ...prev, ...userData } : null);
//   };

//   const refreshAuth = async (): Promise<void> => {
//     await checkAuthStatus();
//   };

//   const value: AuthContextType = {
//     user,
//     isLoading,
//     isAuthenticated: !!user,
//     login,
//     logout,
//     register,
//     updateUser,
//     refreshAuth,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // Higher-order component for protected routes
// export const withAuth = <P extends object>(
//   Component: React.ComponentType<P>
// ): React.FC<P> => {
//   return (props: P) => {
//     const { isAuthenticated, isLoading } = useAuth();

//     if (isLoading) {
//       return (
//         <div className="min-h-screen flex items-center justify-center">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
//             <p className="text-muted-foreground">Loading...</p>
//           </div>
//         </div>
//       );
//     }

//     if (!isAuthenticated) {
//       return (
//         <div className="min-h-screen flex items-center justify-center p-4">
//           <Card className="w-full max-w-md text-center">
//             <CardContent className="pt-6">
//               <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
//               <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
//               <p className="text-muted-foreground mb-4">
//                 Please sign in to access this page.
//               </p>
//               <Button onClick={() => window.location.href = '/login'}>
//                 Sign In
//               </Button>
//             </CardContent>
//           </Card>
//         </div>
//       );
//     }

//     return <Component {...props} />;
//   };
// };






























import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshAuth: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  confirmPassword?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/me`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user || userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Invalid email or password');
      }

      const userData = await response.json();
      setUser(userData.user || userData);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Registration failed');
      }

      const newUser = await response.json();
      setUser(newUser.data?.user || newUser.user || newUser);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      setUser(null);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  const refreshAuth = async (): Promise<void> => {
    await checkAuthStatus();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    updateUser,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-6">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">
                Please sign in to access this page.
              </p>
              <Button onClick={() => window.location.href = '/login'}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return <Component {...props} />;
  };
};