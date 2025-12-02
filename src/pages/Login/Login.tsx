// src/pages/Login/Login.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import styles from './Login.module.css';
import { supabase } from '../../lib/supabase';

const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setError(null);
    setSuccessMessage(null);
  };

  const handleSwitchToSignUp = () => {
    setIsSignUp(true);
    setIsForgotPassword(false);
    clearForm();
  };

  const handleSwitchToSignIn = () => {
    setIsSignUp(false);
    setIsForgotPassword(false);
    clearForm();
  };

  const handleSwitchToForgotPassword = () => {
    setIsForgotPassword(true);
    setIsSignUp(false);
    clearForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('✅ Форма отправлена');

    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/recovery-callback`,
        });

        if (error) throw error;

        setSuccessMessage(`Инструкция по восстановлению пароля отправлена на ${email}. Проверьте почту.`);
      } else if (isSignUp) {
        const result = await signUp(email, password, username);

        if (result.needsEmailConfirmation) {
          setSuccessMessage(`Регистрация успешна! Письмо подтверждения отправлено на ${email}.`);
        }
      } else {
        await signIn(email, password);
        navigate('/', { replace: true });
      }
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : String(err);

      // Более понятные сообщения для пользователя
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

  const getTitle = () => {
    if (isForgotPassword) return 'Восстановить пароль';
    return isSignUp ? 'Создать аккаунт' : 'Добро пожаловать!';
  };

  const getButtonText = () => {
    if (isLoading) return 'Загрузка...';
    if (isForgotPassword) return 'Отправить инструкцию';
    return isSignUp ? 'Зарегистрироваться' : 'Войти';
  };

  return (
    <div className={styles.login}>
      <div className={styles.login__card}>
        <h1 className={styles.login__logo}>TeamBridge</h1>
        <h1 className={styles.login__title}>{getTitle()}</h1>

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

          {!isForgotPassword && (
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          )}

          {error && (
            <div className={styles.login__error} role="alert">
              {error}
            </div>
          )}

          {successMessage && (
            <div className={styles.login__success} role="status">
              {successMessage}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className={styles.login__button}
          >
            {getButtonText()}
          </Button>
        </form>

        <div className={styles.login__switch}>
          {isForgotPassword ? (
            <button
              type="button"
              onClick={handleSwitchToSignIn}
              className={styles.login__switchButton}
              disabled={isLoading}
            >
              Обратно к авторизации
            </button>
          ) : (
            <div className={styles.login__links}>
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
                  onClick={handleSwitchToForgotPassword}
                  className={styles.login__switchButton}
                  disabled={isLoading}
                >
                  Забыли пароль?
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;