// import React from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '@/contexts/authContext';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { AlertCircle } from 'lucide-react';

// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   requireAuth?: boolean;
//   redirectTo?: string;
// }

// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
//   children, 
//   requireAuth = true,
//   redirectTo = '/login'
// }) => {
//   const { isAuthenticated, isLoading } = useAuth();
//   const location = useLocation();

//   // Show loading state while checking authentication
//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-background">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
//           <p className="text-muted-foreground">Checking authentication...</p>
//         </div>
//       </div>
//     );
//   }

//   // If authentication is required but user is not authenticated
//   if (requireAuth && !isAuthenticated) {
//     return (
//       <Navigate 
//         to={redirectTo} 
//         state={{ from: location }} 
//         replace 
//       />
//     );
//   }

//   // If user is authenticated but shouldn't be (e.g., login page when already logged in)
//   if (!requireAuth && isAuthenticated) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return <>{children}</>;
// };

// // Alternative component for inline protection without navigation
// export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { isAuthenticated, isLoading } = useAuth();

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center p-8">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
//           <p className="text-sm text-muted-foreground">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <Card className="w-full max-w-md text-center mx-auto">
//         <CardContent className="pt-6">
//           <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
//           <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
//           <p className="text-muted-foreground mb-4">
//             Please sign in to access this content.
//           </p>
//           <Button onClick={() => window.location.href = '/login'}>
//             Sign In
//           </Button>
//         </CardContent>
//       </Card>
//     );
//   }

//   return <>{children}</>;
// };

// export default ProtectedRoute;

















import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/authContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // For meeting routes, allow public access
  if (location.pathname.startsWith('/meeting/')) {
    return <>{children}</>;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If user is authenticated but shouldn't be (e.g., login page when already logged in)
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md text-center mx-auto">
        <CardContent className="pt-6">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
          <p className="text-muted-foreground mb-4">
            Please sign in to access this content.
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;