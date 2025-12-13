// src/components/modals/profile-modal/profile-modal.tsx
import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useUI } from '../../../contexts/UIContext';
import styles from './profile-modal.module.css';

const ProfileModal: React.FC = () => {
  const { closeProfile } = useUI();
  const { user, signOut } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  // Получаем позицию кнопки
  useEffect(() => {
    const updatePosition = () => {
      const button = document.querySelector('[data-profile-button]') as HTMLButtonElement;
      if (button) {
        const rect = button.getBoundingClientRect();
        const top = rect.bottom - 200; // высота модалки
        const left = rect.right + 8;
        setPosition({ top, left });
      }
    };

    // Запускаем синхронно
    updatePosition();

    // Подстраховка: если кнопка появилась позже
    const timer = setTimeout(updatePosition, 50);
    return () => clearTimeout(timer);
  }, []);

  // Закрытие по клику мимо
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const button = document.querySelector('[data-profile-button]');
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        !button?.contains(e.target as Node)
      ) {
        closeProfile();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeProfile]);

  // Пока позиция не найдена — ничего не рендерим
  if (!position) {
    return null;
  }

  return (
    <div
      ref={modalRef}
      className={styles['profile-modal']}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: '220px',
        zIndex: 1000,
        transform: 'none',
      }}
      role="dialog"
      aria-label="Профиль пользователя"
    >
      <div className={styles['profile-modal__content']}>
        <div className={styles['profile-modal__header']}>
          <h3>Профиль</h3>
        </div>
        <div className={styles['profile-modal__body']}>
          <p><strong>Имя:</strong> {user?.full_name || user?.username || 'Без имени'}</p>
          <p><strong>Email:</strong> {user?.email || 'Не указан'}</p>
        </div>
        <div className={styles['profile-modal__footer']}>
          <button
            className={styles['profile-modal__btn']}
            onClick={closeProfile}
          >
            Закрыть
          </button>
          <button
            className={`${styles['profile-modal__btn']} ${styles['profile-modal__btn_logout']}`}
            onClick={async () => {
              try {
                await signOut();
              } catch (err) {
                console.error('Ошибка выхода:', err);
              }
            }}
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
