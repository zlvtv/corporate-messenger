// src/pages/Login/Login.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import styles from './Login.module.css';

const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // ← Новое состояние

  const { signUp, signIn } = useAuth();

  useEffect(() => {
    setError(null);
    setSuccessMessage(null);
    setEmail('');
    setPassword('');
    setUsername('');
  }, [isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isSignUp) {
        const result = await signUp(email, password, username);
        
        if (result.needsEmailConfirmation) {
          setSuccessMessage('Registration successful! Please check your email to confirm your account. The confirmation link will expire in 24 hours.');
          // Очищаем форму после успешной регистрации
          setEmail('');
          setPassword('');
          setUsername('');
        } else if (result.session) {
          // Если сразу вошли (email confirmation отключен)
          setSuccessMessage('Registration successful! Redirecting...');
        }
      } else {
        await signIn(email, password);
        // После успешного входа редирект произойдет автоматически через AuthContext
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.login}>
      <div className={styles.login__card}>
        <h1 className={styles.login__title}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        
        <form onSubmit={handleSubmit} className={styles.login__form}>
          {isSignUp && (
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}
          
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Сообщение об ошибке */}
          {error && (
            <div className={styles.login__error}>
              {error}
            </div>
          )}

          {/* Сообщение об успехе */}
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
            {isLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </Button>
        </form>

        <div className={styles.login__switch}>
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className={styles.login__switchButton}
          >
            {isSignUp 
              ? 'Already have an account? Sign In' 
              : "Don't have an account? Sign Up"
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;