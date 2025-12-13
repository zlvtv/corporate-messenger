// src/pages/ForgotPassword/ForgotPassword.tsx
import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/button/button';
import Input from '../../components/ui/input/input';
import styles from './ForgotPassword.module.css';

const ForgotPassword: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthLoading && user) {
      navigate('/', { replace: true });
    }
  }, [user, isAuthLoading, navigate]);

  const [email, setEmail] = useState('');
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (isAuthLoading) {
    return <div className={styles.forgot}>Загрузка...</div>;
  }

  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoadingForm(true);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/recovery/callback`,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Ошибка: ${message}`);
    } finally {
      setIsLoadingForm(false);
    }
  };

  return (
    <div className={styles.forgot}>
      <div className={styles.forgot__card}>
        <h1 className={styles.forgot__title}>Восстановление пароля</h1>
        <p className={styles.forgot__subtitle}>
          Введите email — отправим ссылку для сброса пароля.
        </p>

        {success ? (
          <div className={styles.forgot__success}>
            Письмо отправлено! Проверьте почту.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.forgot__form}>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoadingForm}
            />

            {error && (
              <div className={styles.forgot__error} role="alert">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={isLoadingForm || !email}
              className={styles.forgot__button}
            >
              {isLoadingForm ? 'Отправка...' : 'Отправить ссылку'}
            </Button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className={styles.forgot__back}
            >
              Назад ко входу
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
