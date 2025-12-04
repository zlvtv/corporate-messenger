// src/pages/Login/Login.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/button/button';
import Input from '../../components/ui/input/input';
import styles from './Login.module.css';

const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setError(null);
  };

  const handleSwitchToSignUp = () => {
    setIsSignUp(true);
    clearForm();
  };

  const handleSwitchToSignIn = () => {
    setIsSignUp(false);
    clearForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        const result = await signUp(email, password, username);

        if (result.needsEmailConfirmation) {
          // После регистрации — перенаправим с сообщением
          navigate('/login?registered=true', { replace: true });
        }
      } else {
        await signIn(email, password);
        navigate('/', { replace: true });
      }
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : String(err);

      const userFriendlyMessage = (() => {
        if (rawMessage.includes('Leaked password')) {
          return 'Этот пароль был раскрыт в утечках данных. Пожалуйста, используйте более надёжный пароль.';
        }
        if (rawMessage.includes('Invalid login credentials')) {
          return 'Неверный email или пароль.';
        }
        if (rawMessage.includes('NetworkError')) {
          return 'Ошибка сети. Проверьте подключение к интернету.';
        }
        return `Ошибка: ${rawMessage}`;
      })();

      setError(userFriendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.login}>
      <div className={styles.login__card}>
        <h1 className={styles.login__logo}>TeamBridge</h1>
        <h1 className={styles.login__title}>{isSignUp ? 'Создать аккаунт' : 'Добро пожаловать!'}</h1>

        <form onSubmit={handleSubmit} className={styles.login__form}>
          {isSignUp && (
            <Input
              type="text"
              placeholder="Имя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          )}

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
            {isLoading ? 'Загрузка...' : isSignUp ? 'Зарегистрироваться' : 'Войти'}
          </Button>

          <div className={styles.login__switch}>
            <button
              type="button"
              onClick={isSignUp ? handleSwitchToSignIn : handleSwitchToSignUp}
              className={styles.login__switchButton}
              disabled={isLoading}
            >
              {isSignUp ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Регистрация'}
            </button>

            {!isSignUp && (
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className={styles.login__switchButton}
                disabled={isLoading}
              >
                Забыли пароль?
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
