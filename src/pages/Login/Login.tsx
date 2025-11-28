import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import styles from './Login.module.css';
import { supabase } from '../../lib/supabase';

/**
 * Компонент аутентификации с поддержкой входа, регистрации и восстановления пароля
 */
const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { signUp, signIn } = useAuth();

  useEffect(() => {
    clearForm();
  }, [isSignUp, isForgotPassword]);

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isForgotPassword) {
        const redirectUrl = `${window.location.origin}/recovery-callback`;
        
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        });
      
        if (error) throw error;
      
        setSuccessMessage(`Инструкция по восстановлению пароля была отправлена на ${email}. Пожалуйста, проверьте входящие письма.`);
        setEmail('');
      } else if (isSignUp) {
        const result = await signUp(email, password, username);
        
        if (result.needsEmailConfirmation) {
          setSuccessMessage(`Успешная регистрация! Мы отправили письмо с кодом подтверждения на ${email}. Пожалуйста, проверьте вашу почту и нажмите на ссылку в отправленном письме для активации аккаунта.`);
        } else if (result.session) {
          setSuccessMessage('Почта успешно подтверждена! Происходит перенаправление...');
        }
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Случилась непредвиденная ошибка:';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToSignIn = () => {
    setIsSignUp(false);
    setIsForgotPassword(false);
  };

  const handleSwitchToSignUp = () => {
    setIsSignUp(true);
    setIsForgotPassword(false);
  };

  const handleSwitchToForgotPassword = () => {
    setIsForgotPassword(true);
    setIsSignUp(false);
  };

  const getTitle = () => {
    if (isForgotPassword) return 'Восстановить пароль';
    return isSignUp ? 'Создать аккаунт' : 'Добро пожаловать!';
  };

  const getSubmitButtonText = () => {
    if (isLoading) return 'Загрузка...';
    if (isForgotPassword) return 'Получить инструкцию';
    return isSignUp ? 'Зарегистрироваться' : 'Войти';
  };

  return (
    <div className={styles.login}>
      <div className={styles.login__card}>
        <h1 className={styles.login__title}>
          {getTitle()}
        </h1>
        
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
            placeholder="Логин"
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
            <div className={styles.login__error}>
              {error.includes('already registered') ? (
                <div>
                  <strong>Адрес почты уже зарегистрирован.</strong>
                  <br />
                  Просьба пройти авторизацию или использовать другой почтовый адрес.
                </div>
              ) : (
                error
              )}
            </div>
          )}

          {successMessage && (
            <div className={styles.login__success}>
              {successMessage}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className={styles.login__button}
          >
            {getSubmitButtonText()}
          </Button>
        </form>

        <div className={styles.login__switch}>
          {isForgotPassword ? (
            <div className={styles.login__links}>
              <button
                type="button"
                onClick={handleSwitchToSignIn}
                className={styles.login__switchButton}
                disabled={isLoading}
              >
                Обратно к авторизации
              </button>
            </div>
          ) : (
            <div className={styles.login__links}>
              <button
                type="button"
                onClick={isSignUp ? handleSwitchToSignIn : handleSwitchToSignUp}
                className={styles.login__switchButton}
                disabled={isLoading}
              >
                {isSignUp 
                  ? 'Уже есть аккаунт? Войти' 
                  : "Нет аккаунта? Зарегистрироваться"
                }
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