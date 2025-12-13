// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UIProvider } from './contexts/UIContext';
import { OrganizationProvider } from './contexts/OrganizationContext'; // Опечатка? Возможно, ProjectProvider должен быть здесь
import { ProjectProvider } from './contexts/ProjectContext';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import AuthCallback from './pages/AuthCallback/AuthCallback';
import LoadingState from './components/ui/loading/LoadingState';

// Приватный маршрут: только для авторизованных
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isInitialized, isLoading } = useAuth();

  if (!isInitialized || isLoading) return <LoadingState />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Публичный маршрут: только для НЕавторизованных
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isInitialized, isLoading } = useAuth();
  if (!isInitialized || isLoading) return <LoadingState />;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// Для обработки колбэков: показываем только если НЕ авторизован, иначе редирект
const AuthCallbackRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isInitialized, isLoading } = useAuth();
  if (!isInitialized || isLoading) return <LoadingState />;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// Фолбэк: 404 + редирект по авторизации
const FallbackRoute: React.FC = () => {
  const { user, isInitialized, isLoading } = useAuth();
  if (!isInitialized || isLoading) return <LoadingState />;
  return <Navigate to={user ? '/' : '/login'} replace />;
};

// Основные маршруты
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/auth/callback" element={<AuthCallbackRoute><AuthCallback /></AuthCallbackRoute>} />
      <Route path="/" element={<PrivateRoute><OrganizationProvider><ProjectProvider><Dashboard /></ProjectProvider></OrganizationProvider></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><OrganizationProvider><ProjectProvider><Dashboard /></ProjectProvider></OrganizationProvider></PrivateRoute>} />
      <Route path="*" element={<FallbackRoute />} />
    </Routes>
  );
};

// Основной компонент
const App: React.FC = () => {
  return (
    <AuthProvider>
      <UIProvider>
        <Router>
          <AppRoutes />
        </Router>
      </UIProvider>
    </AuthProvider>
  );
};

export default App;
