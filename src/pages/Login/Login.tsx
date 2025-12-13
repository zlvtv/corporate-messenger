// src/pages/Login/Login.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/button/button';
import Input from '../../components/ui/input/input';
import styles from './Login.module.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(email, password);
      // После успешного входа AuthContext обновит состояние и AppRoutes перенаправит
    } catch (err: any) {
      setError(err.message || 'Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.login}>
      <div className={styles.login__card}>
        <h1 className={styles.login__logo}>TeamBridge</h1>
        <h1 className={styles.login__title}>Добро пожаловать!</h1>

        <form onSubmit={handleSubmit} className={styles.login__form}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="current-password"
          />

          {error && (
            <div className={styles.login__error} role="alert">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className={styles.login__button}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>

          <div className={styles.login__links}>
            <Link to="/password-recovery" className={styles.login__link}>
              Забыли пароль?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;