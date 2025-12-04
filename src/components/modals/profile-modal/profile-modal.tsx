// src/components/modals/profile-modal/profile-modal.tsx
import React, { useRef, useState } from 'react';
import { useOrganization } from '../../../contexts/OrganizationContext';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './profile-modal.module.css';

interface ProfileModalProps {
  anchorEl: HTMLElement;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ anchorEl, onClose }) => {
  const { createOrganization, joinOrganization } = useOrganization();
  const { user, signOut } = useAuth();
  const [orgName, setOrgName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Позиционирование — снизу справа от кнопки
  const rect = anchorEl.getBoundingClientRect();
  const top = rect.bottom + 8;
  const right = window.innerWidth - rect.right;

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;
    setIsCreating(true);
    setError(null);
    try {
      await createOrganization({ name: orgName.trim() });
      setOrgName('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать организацию');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setIsJoining(true);
    setError(null);
    try {
      await joinOrganization(inviteCode.trim());
      setInviteCode('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось вступить');
    } finally {
      setIsJoining(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Вы уверены, что хотите удалить аккаунт? Все данные будут безвозвратно удалены.')) {
      // Здесь должна быть логика удаления аккаунта
      alert('Функция удаления аккаунта временно недоступна.');
    }
  };

  return (
    <div
      className={styles['profile-backdrop']}
      onClick={handleOutsideClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className={styles['profile-modal']}
        style={{ top, right }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={styles['profile-modal__title']}>Профиль</h3>

        {error && <p className={styles['profile-modal__error']}>{error}</p>}

        <div className={styles['profile-modal__section']}>
          <h4 className={styles['profile-modal__section-title']}>Email</h4>
          <p>{user?.email}</p>
        </div>

        <div className={styles['profile-modal__section']}>
          <h4 className={styles['profile-modal__section-title']}>Создать организацию</h4>
          <form onSubmit={handleCreateOrg}>
            <input
              type="text"
              className={styles['profile-modal__input']}
              placeholder="Название организации"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              disabled={isCreating}
            />
            <button
              type="submit"
              className={styles['profile-modal__btn']}
              disabled={isCreating || !orgName.trim()}
            >
              {isCreating ? 'Создание...' : 'Создать'}
            </button>
          </form>
        </div>

        <div className={styles['profile-modal__section']}>
          <h4 className={styles['profile-modal__section-title']}>Вступить в организацию</h4>
          <form onSubmit={handleJoinOrg}>
            <input
              type="text"
              className={styles['profile-modal__input']}
              placeholder="Код приглашения"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              disabled={isJoining}
            />
            <button
              type="submit"
              className={styles['profile-modal__btn']}
              disabled={isJoining || !inviteCode.trim()}
            >
              {isJoining ? 'Проверка...' : 'Вступить'}
            </button>
          </form>
        </div>

        <div className={styles['profile-modal__section']}>
          <button
            className={styles['profile-modal__action-btn']}
            onClick={() => alert('Редактирование профиля временно недоступно')}
          >
            Редактировать профиль
          </button>
        </div>

        <div className={styles['profile-modal__section']}>
          <button
            className={styles['profile-modal__action-btn'] + ' ' + styles['profile-modal__action-btn--danger']}
            onClick={handleDeleteAccount}
          >
            Удалить аккаунт
          </button>
        </div>

        <button
          className={styles['profile-modal__close']}
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
