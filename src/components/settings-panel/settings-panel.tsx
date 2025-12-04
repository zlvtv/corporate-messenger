// src/components/settings-panel/settings-panel.tsx
import React, { useState } from 'react';
import { useUI } from '../../contexts/UIContext';
import ProfileModal from '../../components/modals/profile-modal/profile-modal';
import styles from './settings-panel.module.css';
import { createPortal } from 'react-dom';

const SettingsPanel: React.FC = () => {
  const { theme, toggleTheme, openProfile } = useUI();
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);

  const handleProfileClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setProfileAnchor(e.currentTarget);
    openProfile();
  };

  return (
    <>
      <div className={styles['settings-panel']}>
        {/* Переключение темы */}
        <button
          className={styles['settings-panel__theme-btn']}
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
        >
          {theme === 'dark' ? '🔆' : '🌙'}
        </button>

        {/* Аватарка профиля */}
        <button
          className={styles['settings-panel__avatar-btn']}
          onClick={handleProfileClick}
          aria-label="Профиль"
        >
          👤
        </button>
      </div>

      {/* Модалка профиля — рядом с иконкой */}
      {profileAnchor &&
        createPortal(
          <ProfileModal anchorEl={profileAnchor} />,
          document.body
        )}
    </>
  );
};

export default SettingsPanel;
