// src/components/empty-dashboard/EmptyDashboard.tsx
import React from 'react';
import { useUI } from '../../contexts/UIContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import styles from './EmptyDashboard.module.css';

const EmptyDashboard: React.FC = () => {
  const { theme } = useUI();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.warn('Logout API не обязателен');
    } finally {
      // Просто выходим через Supabase
      await supabase.auth.signOut();
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className={`${styles.container} ${theme}`}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          Добро пожаловать, {user?.username || user?.email?.split('@')[0] || 'Пользователь'}!
        </h1>
        <p className={styles.subtitle}>
          Вы ещё не состоите ни в одной организации.
        </p>
        <div className={styles.actions}>
          <button
            className={styles.primary}
            onClick={() => document.getElementById('create-org-btn')?.click()}
          >
            Создать организацию
          </button>
          <button
            className={styles.secondary}
            onClick={() => document.getElementById('join-org-btn')?.click()}
          >
            Вступить по коду
          </button>
        </div>
        <p className={styles.tip}>
          Организации позволяют работать в команде, делиться проектами и задачами.
        </p>
      </div>
      <div className={styles.header}>
        <button
          className={styles.logoutBtn}
          onClick={handleLogout}
          aria-label="Выйти из аккаунта"
        >
          Выйти
        </button>
      </div>
    </div>
  );
};

export default EmptyDashboard;
