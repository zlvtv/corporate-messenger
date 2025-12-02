// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrganizationProvider } from './context/OrganizationContext';
import { ProjectProvider } from './contexts/ProjectContext';
import Login from './pages/Login/Login';
import AuthCallback from './pages/AuthCallback/AuthCallback';
import RecoveryCallback from './pages/RecoveryCallback/RecoveryCallback';
import Dashboard from './pages/Dashboard/Dashboard';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import styles from './App.module.css';
import { UIProvider } from './context/UIContext';

// === Состояние загрузки ===
const LoadingState: React.FC = () => (
  <div className={styles.loadingContainer}>
    <div className={styles.loadingSpinner} />
    <span>Загрузка...</span>
  </div>
);

// === Защищённый маршрут: только для авторизованных ===
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isInitialized } = useAuth();

  if (!isInitialized) return <LoadingState />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <OrganizationProvider>
      <ProjectProvider>
        {children}
      </ProjectProvider>
    </OrganizationProvider>
  );
};

// === Гостевой маршрут: только для НЕавторизованных ===
const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isInitialized } = useAuth();

  if (!isInitialized) return <LoadingState />;

  // 🔓 Разрешаем доступ к /password-recovery, если это recovery-сессия
  if (user) {
    // Проверим, можно ли менять пароль
    // Supabase не даёт прямого флага, но можно проверить через API
    const isRecovery = window.location.pathname === '/password-recovery';

    if (isRecovery) {
      return <>{children}</>; // ✅ Пускаем на /password-recovery даже если user есть
    }

    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};  

// === Приложение ===
function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <BrowserRouter>
        <Routes>
          {/* Гостевые маршруты — только без сессии */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/password-recovery"
            element={
              <GuestRoute>
                <ResetPassword />
              </GuestRoute>
            }
          />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/recovery-callback" element={<RecoveryCallback />} />

          {/* Защищённые маршруты — только с сессией */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
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

          {/* Редирект */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      </UIProvider>
    </AuthProvider>
  );
}

export default App;