import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './recovery-callback.module.css';

const RecoveryCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {

    const urlParams = new URLSearchParams(window.location.search);
    const oobCode = urlParams.get('oobCode');

    if (oobCode) {
      localStorage.setItem('reset_password_oobCode', oobCode);
      navigate('/reset-password', { replace: true });
    } else {
      navigate('/password-recovery', { replace: true });
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

export default RecoveryCallback;
