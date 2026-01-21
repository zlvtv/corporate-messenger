import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './ForgotPassword.module.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email.trim()) {
      setError('Введите email');
      setIsLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Введите корректный email');
      setIsLoading(false);
      return;
    }

    try {
      const result = await resetPassword(email.trim());

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError('Не удалось отправить письмо. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>{success ? 'Проверьте почту' : 'Восстановление пароля'}</h1>

        {success ? (
  <div className={styles.successContainer}>
    <p className={styles.subtitle}>
      Если аккаунт с email <strong>{email}</strong> существует, вы получите письмо со ссылкой для восстановления.
    </p>
    <p className={styles.spamHint}>Проверьте папку «Спам», если письмо не пришло.</p>
    <button className={styles.submit} onClick={() => navigate('/login')}>
      Войти
    </button>
  </div>
) : (
          <>
            <p className={styles.subtitle}>Введите email, чтобы получить ссылку для восстановления</p>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>Электронная почта</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  disabled={isLoading}
                  className={styles.input}
                />
              </div>
              <button type="submit" className={styles.submit} disabled={isLoading}>
                {isLoading ? 'Отправка...' : 'Отправить ссылку'}
              </button>
            </form>
            <p className={styles.footer}>
              <button
                type="button"
                className={styles.link}
                onClick={() => navigate('/login')}
                disabled={isLoading}
              >
                ← Назад ко входу
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
