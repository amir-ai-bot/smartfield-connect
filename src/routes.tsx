
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Index />
      },
      {
        path: "/login",
        element: <Index />
      },
      {
        path: "/register",
        element: <Index />
      },
      {
        path: "/dashboard",
        element: <Dashboard />
      },
      {
        path: "/calendar",
        element: <Dashboard />
      },
      {
        path: "/contact",
        element: <Index />
      },
      {
        path: "/privacy-policy",
        element: <Index />
      },
      {
        path: "/terms-of-service",
        element: <Index />
      },
      {
        path: "/profile",
        element: <Profile />
      },
      {
        path: "/weather",
        element: <Weather />
      },
      {
        path: "/verify-email",
        element: <Index />
      },
      {
        path: "/reset-password",
        element: <Index />
      },
      {
        path: "/admin",
        element: <Admin />
      },
      {
        path: "/suppliers",
        element: <Suppliers />
      },
      {
        path: "/suppliers/:id",
        element: <SupplierProfilePage />
      },
      {
        path: "/projects/create",
        element: <Projects />
      },
      {
        path: "/projects/:id",
        element: <ProjectDetail />
      },
      {
        path: "/projects",
        element: <Projects />
      },
      {
        path: "/public-projects",
        element: <Projects />
      },
      {
        path: "/conversations/:id",
        element: <ConversationDetail />
      },
      {
        path: "/conversations",
        element: <Conversations />
      },
      {
        path: "/favorites",
        element: <Favorites />
      },
      {
        path: "*",
        element: <NotFound />
      }
    ]
  }
]);

export default router;
