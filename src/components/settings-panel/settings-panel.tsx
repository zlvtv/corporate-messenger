// src/components/settings-panel/settings-panel.tsx
import React, { useRef } from 'react';
import { useUI } from '../../contexts/UIContext';
import ProfileModal from '../../components/modals/profile-modal/profile-modal';
import styles from './settings-panel.module.css';

const SettingsPanel: React.FC = () => {
  const { theme, toggleTheme, isProfileOpen, openProfile } = useUI();

  return (
    <div className={styles['settings-panel']}>
      <button
        className={styles['settings-panel__theme-btn']}
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
      >
        {theme === 'dark' ? '🔆' : '🌙'}
      </button>

      <button
        data-profile-button // ← помечаем для поиска
        className={styles['settings-panel__avatar-btn']}
        onClick={openProfile}
        aria-label="Профиль"
      >
        👤
      </button>

      {isProfileOpen && <ProfileModal />}
    </div>
  );
};

export default SettingsPanel;
