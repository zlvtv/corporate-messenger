// src/pages/RecoveryCallback/RecoveryCallback.tsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import styles from './RecoveryCallback.module.css';

const RecoveryCallback: React.FC = () => {
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => {
    const handleRecovery = async () => {
      const params = new URLSearchParams(search);
      const tokenType = params.get('type');

      if (tokenType !== 'recovery') {
        console.warn('❌ Не recovery-токен:', tokenType);
        return navigate('/login?error=invalid_link', { replace: true });
      }

      // Даем Supabase время обработать токен
      await new Promise(resolve => setTimeout(resolve, 500));

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        console.error('❌ Ошибка сессии:', error);
        return navigate('/login?error=recovery_failed', { replace: true });
      }

      // Успешно: перейдём к смене пароля
      navigate('/reset-password', { replace: true });
    };

    handleRecovery();
  }, [navigate, search]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.spinner}></div>
        <div className={styles.message}>Проверка ссылки восстановления...</div>
      </div>
    </div>
  );
};

export default RecoveryCallback;
