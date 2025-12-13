import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RecoveryCallback: React.FC = () => {
  const { user, isInitialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Если уже инициализировали и пользователь есть - на дашборд
    if (isInitialized && user) {
      navigate('/', { replace: true });
    } else {
      // Если не авторизован - на сброс пароля
      navigate('/password-recovery', { replace: true });
    }
  }, [user, isInitialized, navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #e5e7eb',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '16px'
      }}></div>
      <div style={{ color: '#6b7280', fontSize: '18px' }}>Обработка восстановления пароля...</div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RecoveryCallback;