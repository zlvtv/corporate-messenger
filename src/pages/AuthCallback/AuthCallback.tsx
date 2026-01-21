import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AuthCallback.module.css';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);

    const mode = searchParams.get('mode') || hashParams.get('mode');
    const oobCode = searchParams.get('oobCode') || hashParams.get('oobCode');

    if (!mode || !oobCode) {
      navigate('/password-recovery', { replace: true });
      return;
    }

    switch (mode) {
      case 'verifyEmail':
        navigate(`/confirm?oobCode=${oobCode}`, { replace: true });
        break;

      case 'resetPassword':
        navigate(`/recovery/callback?oobCode=${oobCode}`, { replace: true });
        break;

      case 'signIn':
        navigate(`/confirm?mode=signIn&oobCode=${oobCode}`, { replace: true });
        break;

      default:
        navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.spinner}></div>
        <div className={styles.message}>Обработка ссылки...</div>
      </div>
    </div>
  );
};

export default AuthCallback;
