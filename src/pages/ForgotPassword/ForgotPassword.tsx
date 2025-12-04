// src/pages/ForgotPassword/ForgotPassword.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/button/button';
import Input from '../../components/ui/input/input';
import styles from './ForgotPassword.module.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Введите email');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/recovery/callback`,
      });

      if (error) throw error;

      setSent(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось отправить письмо';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Проверьте почту</h1>
          <p className={styles.subtitle}>
            Мы отправили ссылку для восстановления пароля на <strong>{email}</strong>.
            <br />
            Ссылка действительна 1 час.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/login')}
            className={styles.button}
          >
            Назад ко входу
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Восстановление пароля</h1>
        <p className={styles.subtitle}>
          Введите email, указанный при регистрации. Мы пришлём ссылку для смены пароля.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className={styles.button}
          >
            {isLoading ? 'Отправляем...' : 'Отправить ссылку'}
          </Button>

          <div className={styles.footer}>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className={styles.backButton}
            >
              ← Назад ко входу
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
