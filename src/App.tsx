
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import TestEnv from "./components/TestEnv";
import router from "./routes";

// Import pages
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Suppliers from './pages/Suppliers';
import Weather from './pages/Weather';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Admin from './pages/Admin';
import Conversations from './pages/Conversations';
import ConversationDetail from './pages/ConversationDetail';
import Favorites from './pages/Favorites';
import SupplierProfilePage from './pages/SupplierProfilePage';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";

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
          <Navbar />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Index />} />
              <Route path="/register" element={<Index />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/projects/create" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/conversations/:id" element={<ConversationDetail />} />
                <Route path="/conversations" element={<Conversations />} />
                <Route path="/favorites" element={<Favorites />} />
              </Route>
              
              {/* Admin routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
              
              {/* Public routes */}
              <Route path="/calendar" element={<Dashboard />} />
              <Route path="/contact" element={<Index />} />
              <Route path="/privacy-policy" element={<Index />} />
              <Route path="/terms-of-service" element={<Index />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/verify-email" element={<Index />} />
              <Route path="/reset-password" element={<Index />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/suppliers/:id" element={<SupplierProfilePage />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/public-projects" element={<Projects />} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </LanguageProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
