// src/pages/Dashboard/Dashboard.tsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button/Button';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.dashboard__header}>
        <div className={styles.dashboard__headerContent}>
          <h1>Corporate Messenger</h1>
          <div className={styles.dashboard__userInfo}>
            <span>Welcome, {user?.username || user?.email}!</span>
            <Button variant="secondary" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      <main className={styles.dashboard__main}>
        <div className={styles.dashboard__sidebar}>
          <h2>Organizations</h2>
          <p>Your organizations will appear here...</p>
        </div>
        
        <div className={styles.dashboard__content}>
          <div className={styles.dashboard__welcome}>
            <h2>Welcome to your dashboard!</h2>
            <p>This is where your organizations, channels, and messages will appear.</p>
            <p>Next week we'll start building the organizations functionality.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;