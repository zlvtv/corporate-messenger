// src/pages/ResetPassword/ResetPassword.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import styles from './ResetPassword.module.css';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('access_token');

  // Если нет токена — нельзя сбрасывать
  useEffect(() => {
    if (!token) {
      setError('Неверная ссылка. Пожалуйста, запросите новую.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

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
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess(true);
    } catch (err) {
      setError('Не удалось обновить пароль. Ссылка могла устареть.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <h1 className={styles.title}>Ошибка</h1>
          <p className={styles.error}>Неверная или устаревшая ссылка</p>
          <button className={styles.submit} onClick={() => navigate('/forgot-password')}>
            Запросить новую
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Новый пароль</h1>
        <p className={styles.subtitle}>Введите новый пароль для аккаунта</p>

        {error && <div className={styles.error}>{error}</div>}
        {success ? (
          <>
            <p className={styles.success}>Пароль успешно изменён!</p>
            <button className={styles.submit} onClick={() => navigate('/login')}>
              Войти
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>
                Новый пароль
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="confirm" className={styles.label}>
                Подтвердите пароль
              </label>
              <input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className={styles.input}
              />
            </div>

            <button
              type="submit"
              className={styles.submit}
              disabled={isLoading}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
