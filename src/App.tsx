import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/auth-context';
import { UIProvider } from './contexts/ui-context';
import { OrganizationProvider } from './contexts/organization-context';
import { ProjectProvider } from './contexts/project-context';
import Login from './pages/Login/Login';
import SignUp from './pages/sign-up/sign-up';
import Dashboard from './pages/dashboard/dashboard';
import Confirm from './pages/confirm/confirm';
import InvitePage from './pages/invite-page/invite-page';
import Landing from './pages/landing/landing';
import LoadingState from './components/ui/loading/loading';
import ForgotPassword from './pages/forgot-password/forgot-password';
import ResetPassword from './pages/reset-password/reset-password';
import AuthCallback from './pages/auth-callback/auth-callback';
import RecoveryCallback from './pages/recovery-callback/recovery-callback';

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isInitialized, isLoading } = useAuth();

  if (!isInitialized || isLoading) return <LoadingState />;
  if (user) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isEmailVerified, isInitialized, isLoading } = useAuth();

  if (!isInitialized || isLoading) return <LoadingState />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isEmailVerified) return <Navigate to="/confirm" replace />;

  return <>{children}</>;
};

const UnprotectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isInitialized, isLoading } = useAuth();
  if (!isInitialized && isLoading) return <LoadingState />;
  return <>{children}</>;
};

const VerifyEmailRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isEmailVerified, isInitialized, isLoading } = useAuth();

  if (!isInitialized || isLoading) return <LoadingState />;
  if (!user) return <Navigate to="/login" replace />;
  if (isEmailVerified) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

const handleAuthRedirects = () => {
  if (window.location.pathname === '/' && window.location.hash) {
    const hash = window.location.hash;

    if (hash.includes('access_token')) {
      if (hash.includes('type=recovery')) {
        window.location.replace(`/recovery/callback${hash}`);
        return true;
      }
      if (hash.includes('type=signup')) {
        window.location.replace(`/confirm${hash}`);
        return true;
      }
    }
  }
  return false;
};

const AppRoutes: React.FC = () => {
  useEffect(() => {
    if (handleAuthRedirects()) {
      return;
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
      <Route path="/password-recovery" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

      <Route path="/auth/callback" element={<UnprotectedRoute><AuthCallback /></UnprotectedRoute>} />
      <Route path="/recovery/callback" element={<UnprotectedRoute><RecoveryCallback /></UnprotectedRoute>} />

      <Route
        path="/reset-password"
        element={
          <UnprotectedRoute>
            {useAuth().user ? <Navigate to="/dashboard" replace /> : <ResetPassword />}
          </UnprotectedRoute>
        }
      />

      <Route path="/confirm" element={<VerifyEmailRoute><Confirm /></VerifyEmailRoute>} />

      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

      <Route path="/invite/:token" element={<UnprotectedRoute><InvitePage /></UnprotectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <UIProvider>
        <OrganizationProvider>
          <ProjectProvider>
            <Router>
              <AppRoutes />
            </Router>
          </ProjectProvider>
        </OrganizationProvider>
      </UIProvider>
    </AuthProvider>
  );
};

export default App;
