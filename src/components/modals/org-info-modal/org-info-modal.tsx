// src/components/modals/org-info-modal/org-info-modal.tsx
import React, { useRef, useEffect, useState } from 'react';
import { useOrganization } from '../../../contexts/OrganizationContext';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../ui/button/button';
import styles from './org-info-modal.module.css';

interface OrgInfoModalProps {
  anchorEl: HTMLElement;
  onClose: () => void;
}

const OrgInfoModal: React.FC<OrgInfoModalProps> = ({ anchorEl, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { currentOrganization, deleteOrganization, regenerateInviteCode } = useOrganization();
  const { user } = useAuth();
  const [isRegenerating, setIsRegenerating] = useState(false);

  const isOwner = currentOrganization?.created_by === user?.id;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        !anchorEl.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [anchorEl, onClose]);

  if (!currentOrganization) return null;

  const handleDeleteOrg = async () => {
    if (window.confirm('Вы уверены, что хотите удалить организацию? Все данные будут потеряны.')) {
      await deleteOrganization(currentOrganization.id);
      onClose();
    }
  };

  const handleRegenerateCode = async () => {
    if (window.confirm('Сгенерировать новый код? Старый станет недействительным.')) {
      setIsRegenerating(true);
      await regenerateInviteCode(currentOrganization.id);
      setIsRegenerating(false);
    }
  };

  // Позиционирование: модалка — слева от кнопки
  const anchorRect = anchorEl.getBoundingClientRect();
  const modalWidth = 360; // ширина модалки из CSS
  const leftGap = 8; // небольшой отступ

  // Позиция слева: кнопка.left - ширина_модалки - отступ
  let left = anchorRect.left - modalWidth - leftGap;

  // Коррекция, если выходит за левый край экрана
  if (left < 0) {
    left = anchorRect.left + leftGap; // открыть справа
  }

  const top = anchorRect.bottom + 8;

  return (
    <div
      ref={modalRef}
      className={styles.modal}
      style={{
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 10000,
      }}
      role="dialog"
      aria-label="Информация об организации"
    >
      <h3 className={styles.title}>{currentOrganization.name}</h3>

      {currentOrganization.description && (
        <div className={styles.section}>
          <strong>Описание:</strong>
          <p>{currentOrganization.description}</p>
        </div>
      )}

      {isOwner && (
        <div className={styles.section}>
          <strong>Код приглашения:</strong>
          <div className={styles.inviteCode}>
            <code>{currentOrganization.invite_code}</code>
            <Button
              variant="secondary"
              size="small"
              onClick={handleRegenerateCode}
              disabled={!currentOrganization.invite_code_active || isRegenerating}
            >
              {isRegenerating ? 'Обновление...' : 'Обновить'}
            </Button>
          </div>
        </div>
      )}

      <div className={styles.section}>
        <strong>Участники ({currentOrganization.members?.length || 0}):</strong>
        <div className={styles.members}>
          {currentOrganization.members?.map((member) => (
            <div key={member.id} className={styles.member}>
              <div className={styles.avatar} title={member.full_name || member.email}>
                {member.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span>{member.full_name || 'Без имени'}</span>
              <span className={styles.role}>
                {member.role === 'owner' ? 'Владелец' : 'Участник'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          variant="secondary"
          onClick={() => alert('Функция "Выйти" пока не реализована')}
        >
          Выйти из организации
        </Button>
        {isOwner && (
          <Button variant="danger" onClick={handleDeleteOrg}>
            Удалить организацию
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrgInfoModal;
