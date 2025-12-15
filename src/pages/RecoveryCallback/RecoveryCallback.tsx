// src/pages/RecoveryCallback/RecoveryCallback.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import styles from './RecoveryCallback.module.css';

const RecoveryCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Проверяем сессию
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        console.warn('⚠️ [Recovery] Нет активной сессии. Перенаправляем на восстановление');
        // Нет сессии — возможно, ссылка устарела
        navigate('/password-recovery', { replace: true });
        return;
      }

      // Есть сессия — переходим к смене пароля
      console.log('✅ [Recovery] Сессия найдена. Переход на сброс пароля');
      navigate('/reset-password', { replace: true });
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.spinner}></div>
        <div className={styles.message}>Обработка ссылки восстановления...</div>
      </div>
    </div>
  );
};

export default RecoveryCallback;
