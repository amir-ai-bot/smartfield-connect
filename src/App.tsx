
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
          <Toaster />
          <Sonner 
            toastOptions={{ 
              duration: 3000,
              style: { 
                zIndex: 50,
              }
            }} 
            position="top-center"
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
