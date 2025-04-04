
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import UserProfilePage from './pages/UserProfilePage';
import WeatherPage from './pages/WeatherPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminPage from './pages/AdminPage';
import SuppliersPage from './pages/SuppliersPage';
import SupplierProfilePage from './pages/SupplierProfilePage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectPage from './pages/ProjectPage';
import ProjectsPage from './pages/ProjectsPage';
import ConversationPage from './pages/ConversationPage';
import ConversationsPage from './pages/ConversationsPage';
import CalendarPage from './pages/CalendarPage';
import PublicProjectsPage from './pages/PublicProjectsPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <HomePage />
      },
      {
        path: "/login",
        element: <LoginPage />
      },
      {
        path: "/register",
        element: <RegisterPage />
      },
      {
        path: "/dashboard",
        element: <DashboardPage />
      },
      {
        path: "/calendar",
        element: <CalendarPage />
      },
      {
        path: "/contact",
        element: <ContactPage />
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicyPage />
      },
      {
        path: "/terms-of-service",
        element: <TermsOfServicePage />
      },
      {
        path: "/profile",
        element: <UserProfilePage />
      },
      {
        path: "/weather",
        element: <WeatherPage />
      },
      {
        path: "/verify-email",
        element: <VerifyEmailPage />
      },
      {
        path: "/reset-password",
        element: <ResetPasswordPage />
      },
      {
        path: "/admin",
        element: <AdminPage />
      },
      {
        path: "/suppliers",
        element: <SuppliersPage />
      },
      {
        path: "/suppliers/:id",
        element: <SupplierProfilePage />
      },
      {
        path: "/projects/create",
        element: <CreateProjectPage />
      },
      {
        path: "/projects/:id",
        element: <ProjectPage />
      },
      {
        path: "/projects",
        element: <ProjectsPage />
      },
      {
        path: "/public-projects",
        element: <PublicProjectsPage />
      },
      {
        path: "/conversations/:id",
        element: <ConversationPage />
      },
      {
        path: "/conversations",
        element: <ConversationsPage />
      }
    ]
  }
]);

export default router;
