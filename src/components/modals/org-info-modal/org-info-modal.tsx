// src/components/modals/org-info-modal/org-info-modal.tsx
import React, { useRef } from 'react';
import { useOrganization } from '../../../contexts/OrganizationContext';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './org-info-modal.module.css';

interface OrgInfoModalProps {
  anchorEl: HTMLElement;
  onClose: () => void;
}

const OrgInfoModal: React.FC<OrgInfoModalProps> = ({ anchorEl, onClose }) => {
  const { currentOrganization, deleteOrganization, regenerateInviteCode } = useOrganization();
  const { user } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  // Позиционирование — снизу справа от кнопки
  const rect = anchorEl.getBoundingClientRect();
  const top = rect.bottom + 8;
  const right = window.innerWidth - rect.right;

  const isOwner = currentOrganization?.created_by === user?.id;

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

  const handleDeleteOrg = async () => {
    if (window.confirm('Вы уверены, что хотите удалить организацию? Все данные будут потеряны.')) {
      await deleteOrganization(currentOrganization!.id);
      onClose();
    }
  };

  const handleRegenerateCode = async () => {
    if (window.confirm('Сгенерировать новый код? Старый станет недействительным.')) {
      await regenerateInviteCode(currentOrganization!.id);
    }
  };

  return (
    <div
      className={styles['org-info-backdrop']}
      onClick={handleOutsideClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className={styles['org-info-modal']}
        style={{ top, right }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={styles['org-info-modal__title']}>Информация об организации</h3>

        <div className={styles['org-info-modal__section']}>
          <strong>Название:</strong>
          <span>{currentOrganization?.name}</span>
        </div>

        {currentOrganization?.description && (
          <div className={styles['org-info-modal__section']}>
            <strong>Описание:</strong>
            <p>{currentOrganization.description}</p>
          </div>
        )}

        {isOwner && (
          <div className={styles['org-info-modal__section']}>
            <strong>Код приглашения:</strong>
            <div className={styles['org-info-modal__invite-code']}>
              <code>{currentOrganization?.invite_code}</code>
              <button
                className={styles['org-info-modal__regen-btn']}
                onClick={handleRegenerateCode}
                disabled={!currentOrganization?.invite_code_active}
              >
                Обновить
              </button>
            </div>
          </div>
        )}

        <div className={styles['org-info-modal__section']}>
          <strong>Участники ({currentOrganization?.members?.length || 0}):</strong>
          <div className={styles['org-info-modal__members']}>
            {currentOrganization?.members?.map((member) => (
              <div key={member.id} className={styles['org-info-modal__member']}>
                <div
                  className={styles['org-info-modal__avatar']}
                  title={member.full_name || member.email}
                >
                  {member.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span>{member.full_name || 'Без имени'}</span>
                <span className={styles['org-info-modal__role']}>
                  {member.role === 'owner' ? 'Владелец' : 'Участник'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles['org-info-modal__actions']}>
          <button
            className={styles['org-info-modal__btn'] + ' ' + styles['org-info-modal__btn--secondary']}
            onClick={() => alert('Функция "Выйти" пока не реализована')}
          >
            Выйти из организации
          </button>

          {isOwner && (
            <button
              className={styles['org-info-modal__btn'] + ' ' + styles['org-info-modal__btn--danger']}
              onClick={handleDeleteOrg}
            >
              Удалить организацию
            </button>
          )}
        </div>

        <button
          className={styles['org-info-modal__close']}
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default OrgInfoModal;
