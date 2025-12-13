// src/components/ui/loading/LoadingState.tsx
import React from 'react';

const LoadingState: React.FC<{ message?: string }> = ({ message = 'Загрузка...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: 'system-ui, sans-serif',
      textAlign: 'center',
      padding: '20px',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #e5e7eb',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}></div>
      <div style={{ marginTop: '16px', color: '#6b7280', fontSize: '16px' }}>
        {message}
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingState;
