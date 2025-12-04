// src/pages/ResetPassword/ResetPassword.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/button/button';
import Input from '../../components/ui/input/input';
import styles from './ResetPassword.module.css';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidRecovery, setIsValidRecovery] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3); // ← Обратный отсчёт

  const navigate = useNavigate();

  useEffect(() => {
    const checkRecovery = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        setError('Срок действия ссылки истёк или она недействительна.');
        setIsValidRecovery(false);
        return;
      }

      // Проверим тип сессии
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Не удалось получить данные пользователя.');
        setIsValidRecovery(false);
        return;
      }

      // ✅ Всё ок
      setIsValidRecovery(true);
    };

    checkRecovery();
  }, []);

  // Обратный отсчёт при успехе
  useEffect(() => {
    if (successMessage && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      navigate('/login', { replace: true });
    }
  }, [successMessage, countdown, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      await supabase.auth.signOut({ scope: 'global' });
      setSuccessMessage('Пароль успешно изменён! Перенаправление...');
      setCountdown(3);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка при смене пароля';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidRecovery === null) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.loading}>
            <div>Проверка ссылки...</div>
            <div className={styles.loadingSubtext}>Ожидание подтверждения</div>
          </div>
        </div>
      </div>
    );
  }

  if (isValidRecovery === false) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Ошибка восстановления</h1>
          <div className={styles.error}>{error}</div>
          <Button
            variant="primary"
            onClick={() => navigate('/login')}
            className={styles.button}
          >
            На главную
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Новый пароль</h1>
        <p className={styles.subtitle}>
          Введите новый пароль. Ссылка действительна 1 час.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Новый пароль
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Минимум 6 символов"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Подтвердите пароль
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Повторите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}
          {successMessage && (
            <div className={styles.success}>
              {successMessage} ({countdown}…)
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !!successMessage}
            className={styles.button}
          >
            {isLoading ? 'Меняем пароль...' : 'Сменить пароль'}
          </Button>

          <div className={styles.footer}>
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate('/login');
              }}
              className={styles.backButton}
            >
              ← Назад к входу
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
