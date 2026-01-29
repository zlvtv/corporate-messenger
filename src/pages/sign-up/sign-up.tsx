import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import styles from './sign-up.module.css';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const validateUsername = (username: string): string | null => {
    const trimmed = username.trim();
    if (trimmed.length === 0) return 'Имя пользователя обязательно';
    if (trimmed.length < 3) return 'Минимум 3 символа';
    if (trimmed.length > 15) return 'Не более 15 символов';
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return 'Только буквы, цифры, _, -';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setIsLoading(true);

  const usernameError = validateUsername(username);
  if (usernameError) {
    setError(usernameError);
    setIsLoading(false);
    return;
  }

  const emailTrimmed = email.trim();

  try {
    const result = await signUp(emailTrimmed, password, username.trim());

    if (result.error) {
      setError(result.error.message);
    } else {
      navigate('/confirm', { replace: true }); 
    }
  } catch (err: any) {
    setError('Не удалось зарегистрироваться. Попробуйте позже.');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Регистрация</h1>
        <p className={styles.subtitle}>Создайте аккаунт, чтобы начать работу</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="username" className={styles.label}>Имя пользователя</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ваше_имя"
              required
              minLength={3}
              maxLength={15}
              disabled={isLoading}
              className={styles.input}
            />
            <small>3–15 символов. Только a–z, 0–9, _, -</small>
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email</label>
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

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Пароль</label>
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

          <button type="submit" className={styles.submit} disabled={isLoading}>
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className={styles.footer}>
          Уже есть аккаунт?{' '}
          <button
            type="button"
            className={styles.link}
            onClick={() => navigate('/login')}
            disabled={isLoading}
          >
            Войти
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
