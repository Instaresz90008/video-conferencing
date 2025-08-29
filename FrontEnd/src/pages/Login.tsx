
// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Separator } from '@/components/ui/separator';
// import { Video, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
// import { toast } from '@/hooks/use-toast';
// import ThemeToggle from '@/components/ThemeToggle';
// import BackgroundElements from '@/components/decorative/BackgroundElements';

// const Login = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     if (error) setError('');
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.email || !formData.password) {
//       setError('Please fill in all fields');
//       return;
//     }

//     setIsLoading(true);
//     setError('');

//     try {
//       const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include', // for cookie-based auth
//         body: JSON.stringify(formData),
//       });

//       if (!response.ok) {
//         const data = await response.json();
//         throw new Error(data.message || 'Invalid email or password');
//       }

//       const user = await response.json();

//       // Optional: store user info in Redux or Context
//       // dispatch(setUser(user));

//       toast({
//         title: "Welcome back!",
//         description: `Hello ${user.name || 'User'}`,
//       });

//       navigate('/dashboard');
//     } catch (err: any) {
//       console.error(err);
//       setError(err.message || 'Login failed');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDemoLogin = () => {
//     setFormData({
//       email: 'demo@meetconnect.com',
//       password: 'demo123'
//     });
//     toast({
//       title: "Demo credentials loaded",
//       description: "Click 'Sign In' to continue with demo account.",
//     });
//   };

//   return (
//     <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">


//       {/* Back to home link */}
//       <div className="absolute top-4 left-4 z-30">
//         <Button variant="ghost" onClick={() => navigate('/')}>
//           <Video className="w-4 h-4 mr-2" />
//           MeetConnect
//         </Button>
//       </div>

//       <Card className="w-full max-w-md">
//         <CardHeader className="text-center space-y-2">
//           <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mx-auto mb-2">
//             <Video className="w-6 h-6 text-primary-foreground" />
//           </div>
//           <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
//           <CardDescription>
//             Sign in to your MeetConnect account
//           </CardDescription>
//         </CardHeader>

//         <CardContent className="space-y-4">
//           {error && (
//             <Alert variant="destructive">
//               <AlertCircle className="h-4 w-4" />
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   id="email"
//                   name="email"
//                   type="email"
//                   placeholder="Enter your email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   className="pl-10"
//                   disabled={isLoading}
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   id="password"
//                   name="password"
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Enter your password"
//                   value={formData.password}
//                   onChange={handleInputChange}
//                   className="pl-10 pr-10"
//                   disabled={isLoading}
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="sm"
//                   className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                   onClick={() => setShowPassword(!showPassword)}
//                   disabled={isLoading}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-4 w-4 text-muted-foreground" />
//                   ) : (
//                     <Eye className="h-4 w-4 text-muted-foreground" />
//                   )}
//                 </Button>
//               </div>
//             </div>

//             <Button
//               type="submit"
//               className="w-full"
//               disabled={isLoading}
//             >
//               {isLoading ? "Signing in..." : "Sign In"}
//             </Button>
//           </form>

//           <div className="text-center">
//             <Link
//               to="/forgot-password"
//               className="text-sm text-primary hover:underline"
//             >
//               Forgot your password?
//             </Link>
//           </div>

//           <div className="relative">
//             <div className="absolute inset-0 flex items-center">
//               <Separator className="w-full" />
//             </div>
//             <div className="relative flex justify-center text-xs uppercase">
//               <span className="bg-background px-2 text-muted-foreground">
//                 Or
//               </span>
//             </div>
//           </div>

//           <Button
//             variant="outline"
//             className="w-full"
//             onClick={handleDemoLogin}
//             disabled={isLoading}
//           >
//             Try Demo Account
//           </Button>
//         </CardContent>

//         <CardFooter className="text-center">
//           <p className="text-sm text-muted-foreground">
//             Don't have an account?{' '}
//             <Link to="/register" className="text-primary hover:underline">
//               Sign up
//             </Link>
//           </p>
//         </CardFooter>
//       </Card>

//     </div>
//   );
// };

// export default Login;


























import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Video, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/authContext';
import ThemeToggle from '@/components/ThemeToggle';
import BackgroundElements from '@/components/decorative/BackgroundElements';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');

    try {
      await login(formData.email, formData.password);
      
      toast({
        title: "Welcome back!",
        description: "Successfully signed in to your account",
      });

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleDemoLogin = async () => {
    setFormData({
      email: 'demo@meetconnect.com',
      password: 'demo123'
    });

    try {
      await login('demo@meetconnect.com', 'demo123');
      
      toast({
        title: "Demo account loaded",
        description: "Welcome to the MeetConnect demo!",
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError('Demo account is currently unavailable');
      toast({
        title: "Demo unavailable",
        description: "Please try signing in with your own account.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      <BackgroundElements />

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-30">
        <ThemeToggle />
      </div>

      {/* Back to home link */}
      <div className="absolute top-4 left-4 z-30">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <Video className="w-4 h-4 mr-2" />
          MeetConnect
        </Button>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mx-auto mb-2">
            <Video className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your MeetConnect account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  disabled={authLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  disabled={authLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={authLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={authLoading}
            >
              {authLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleDemoLogin}
            disabled={authLoading}
          >
            {authLoading ? "Loading Demo..." : "Try Demo Account"}
          </Button>
        </CardContent>

        <CardFooter className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;