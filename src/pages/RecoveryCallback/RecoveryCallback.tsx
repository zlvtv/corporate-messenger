// src/pages/RecoveryCallback/RecoveryCallback.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const RecoveryCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleRecovery = async () => {
      // Даем Supabase время обработать хэш
      await new Promise(resolve => setTimeout(resolve, 1500));

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        console.error('❌ Ошибка сессии:', error);
        return navigate('/login?error=recovery_failed', { replace: true });
      }

      // ✅ Сессия есть → переходим к смене пароля
      console.log('✅ Recovery сессия активна:', session.user.email);
      navigate('/password-recovery', { replace: true });
    };

    handleRecovery();
  }, [navigate]);

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <p>Processing recovery...</p>
    </div>
  );
};

export default RecoveryCallback;