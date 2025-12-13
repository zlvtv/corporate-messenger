// src/pages/ResetPassword/ResetPassword.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/button/button';
import Input from '../../components/ui/input/input';
import styles from './ResetPassword.module.css';

const ResetPassword: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthLoading && user) {
      navigate('/', { replace: true });
    }
  }, [user, isAuthLoading, navigate]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (isAuthLoading) {
    return <div className={styles.reset}>Загрузка...</div>;
  }

  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoadingForm(true);

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      setIsLoadingForm(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Ошибка: ${message}`);
    } finally {
      setIsLoadingForm(false);
    }
  };

  return (
    <div className={styles.reset}>
      <div className={styles.reset__card}>
        <h1 className={styles.reset__title}>Новый пароль</h1>

        {success ? (
          <div className={styles.reset__success}>
            Пароль изменён! Через 2 секунды перейдёте ко входу.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.reset__form}>
            <Input
              type="password"
              placeholder="Новый пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoadingForm}
              autoComplete="new-password"
            />

            <Input
              type="password"
              placeholder="Подтвердите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoadingForm}
            />

            {error && (
              <div className={styles.reset__error} role="alert">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={isLoadingForm}
              className={styles.reset__button}
            >
              {isLoadingForm ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
