import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import AdminRoute from "@/components/auth/AdminRoute";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Suppliers from "./pages/Suppliers";
import Weather from "./pages/Weather";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import BottomNavbar from "./components/BottomNavbar";
import Conversations from "./pages/Conversations";
import ConversationDetail from "./pages/ConversationDetail";
import Favorites from "./pages/Favorites";
import TestEnv from "./components/TestEnv";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LanguageProvider>
          <TestEnv />
          <Toaster />
          <Sonner 
            position="top-center"
            toastOptions={{ 
              duration: 3000,
              style: { 
                zIndex: 50,
                marginTop: '1rem',
                transform: 'translateY(0)',
                background: 'var(--background)',
                color: 'var(--foreground)',
                borderRadius: '8px',
                padding: '12px 16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              },
              className: "animate-slide-in-from-top",
              classNames: {
                toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                title: "text-sm font-semibold",
                description: "text-sm opacity-90",
                actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                closeButton: "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
              }
            }} 
          />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/conversations" element={<Conversations />} />
                <Route path="/conversations/:conversationId" element={<ConversationDetail />} />
                <Route path="/favorites" element={<Favorites />} />
              </Route>
              
              {/* Public Routes */}
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/weather" element={<Weather />} />
              
              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNavbar />
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
