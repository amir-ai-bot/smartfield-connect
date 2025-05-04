
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import TestEnv from "./components/TestEnv";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

// Create a fallback component to display when errors occur
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Une erreur est survenue</h2>
      <p className="text-gray-600 mb-6">
        Nous sommes désolés pour ce désagrément. Veuillez rafraîchir la page pour réessayer.
      </p>
      <Button
        onClick={resetErrorBoundary}
        className="flex items-center bg-primary hover:bg-primary/90"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Rafraîchir
      </Button>
    </div>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      meta: {
        errorHandler: (error: any) => {
          console.error('Query error:', error);
        }
      }
    },
  },
});

const App = () => (
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onReset={() => {
      // Reset the app state here if needed
      window.location.href = '/';
    }}
  >
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
            <main>
              <Outlet />
            </main>
          </LanguageProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
