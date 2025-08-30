// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { Provider } from "react-redux";
// import { store } from "./store";
// import Index from "./pages/Index";
// import Dashboard from "./pages/Dashboard";
// import Profile from "./pages/Profile";
// import NotFound from "./pages/NotFound";
// import Header from "./components/layout/Header";
// import ChatCenter from "./pages/ChatCenter";
// import ParticipantsPage from "./pages/ParticipantsPage";
// import Home from "./pages/Home";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Email from "./pages/Email";
// import Settings from "./pages/Settings";
// import Analytics from "./pages/Analytics";
// import { AuthProvider } from '@/contexts/authContext';
// import ProtectedRoute from "@/ProtectedRoutes/PrivateRoute";
// import "./lib/i18n"; // Initialize i18n

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       retry: 1,
//       refetchOnWindowFocus: false,
//     },
//   },
// });

// const App = () => {
//   return (
//     <Provider store={store}>
//       <QueryClientProvider client={queryClient}>
//         <TooltipProvider>
//           <AuthProvider>
//             <BrowserRouter>
//               <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
//                 <Header />
//                 <Routes>
//                   {/* Public Routes - redirect to dashboard if already authenticated */}
//                   <Route 
//                     path="/login" 
//                     element={
//                       <ProtectedRoute requireAuth={false}>
//                         <Login />
//                       </ProtectedRoute>
//                     } 
//                   />
//                   <Route 
//                     path="/register" 
//                     element={
//                       <ProtectedRoute requireAuth={false}>
//                         <Register />
//                       </ProtectedRoute>
//                     } 
//                   />
                  
//                   {/* Private Routes - require authentication */}
//                   <Route 
//                     path="/" 
//                     element={
//                       <ProtectedRoute>
//                         <Index />
//                       </ProtectedRoute>
//                     } 
//                   />
//                   <Route 
//                     path="/home" 
//                     element={
//                       <ProtectedRoute>
//                         <Home />
//                       </ProtectedRoute>
//                     } 
//                   />
//                   <Route 
//                     path="/dashboard" 
//                     element={
//                       <ProtectedRoute>
//                         <Dashboard />
//                       </ProtectedRoute>
//                     } 
//                   />
//                   <Route 
//                     path="/meeting" 
//                     element={
//                       <ProtectedRoute>
//                         <Index />
//                       </ProtectedRoute>
//                     } 
//                   />
//                   <Route 
//                     path="/meeting/:meetingId" 
//                     element={
//                       <ProtectedRoute>
//                         <Index />
//                       </ProtectedRoute>
//                     } 
//                   />
//                   <Route 
//                     path="/chat" 
//                     element={
//                       <ProtectedRoute>
//                         <ChatCenter />
//                       </ProtectedRoute>
//                     } 
//                   />
//                   <Route 
//                     path="/email" 
//                     element={
//                       <ProtectedRoute>
//                         <Email />
//                       </ProtectedRoute>
//                     } 
//                   />
//                   <Route 
//                     path="/participants" 
//                     element={
//                       <ProtectedRoute>
//                         <ParticipantsPage />
//                       </ProtectedRoute>
//                     } 
//                   />
//                   <Route 
//                     path="/settings" 
//                     element={
//                       <ProtectedRoute>
//                         <Settings />
//                       </ProtectedRoute>
//                     } 
//                   />
//                   <Route 
//                     path="/profile" 
//                     element={
//                       <ProtectedRoute>
//                         <Profile />
//                       </ProtectedRoute>
//                     } 
//                   />
//                   <Route 
//                     path="/analytics" 
//                     element={
//                       <ProtectedRoute>
//                         <Analytics />
//                       </ProtectedRoute>
//                     } 
//                   />
                  
//                   {/* Fallback */}
//                   <Route path="*" element={<NotFound />} />
//                 </Routes>
//               </div>
//               <Toaster />
//               <Sonner />
//             </BrowserRouter>
//           </AuthProvider>
//         </TooltipProvider>
//       </QueryClientProvider>
//     </Provider>
//   );
// };

// export default App;





































import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Header from "./components/layout/Header";
import ChatCenter from "./pages/ChatCenter";
import ParticipantsPage from "./pages/ParticipantsPage";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Email from "./pages/Email";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import { AuthProvider } from '@/contexts/authContext';
import ProtectedRoute from "@/ProtectedRoutes/PrivateRoute";
import "./lib/i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
                <Header />
                <Routes>
                  {/* Public Routes */}
                  <Route 
                    path="/login" 
                    element={
                      <ProtectedRoute requireAuth={false}>
                        <Login />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/register" 
                    element={
                      <ProtectedRoute requireAuth={false}>
                        <Register />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Meeting Routes - PUBLIC ACCESS */}
                  <Route path="/meeting/:meetingId" element={<Index />} />
                  <Route path="/meeting" element={<Index />} />
                  
                  {/* Protected Routes - require authentication */}
                  <Route 
                    path="/" 
                    element={
                      <ProtectedRoute>
                        <Home />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/home" 
                    element={
                      <ProtectedRoute>
                        <Home />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/chat" 
                    element={
                      <ProtectedRoute>
                        <ChatCenter />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/email" 
                    element={
                      <ProtectedRoute>
                        <Email />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/participants" 
                    element={
                      <ProtectedRoute>
                        <ParticipantsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/analytics" 
                    element={
                      <ProtectedRoute>
                        <Analytics />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Toaster />
              <Sonner />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;