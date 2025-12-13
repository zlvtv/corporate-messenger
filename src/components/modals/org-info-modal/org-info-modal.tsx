// src/components/modals/org-info-modal/org-info-modal.tsx
import React, { useState } from 'react';
import { useOrganization } from '../../../contexts/OrganizationContext';
import { useAuth } from '../../../contexts/AuthContext';
import Modal from '../../ui/modal/modal';
import Button from '../../ui/button/button';
import styles from './org-info-modal.module.css';

interface OrgInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrgInfoModal: React.FC<OrgInfoModalProps> = ({ isOpen, onClose }) => {
  const { currentOrganization, deleteOrganization, regenerateInviteCode } = useOrganization();
  const { user } = useAuth();
  const [isRegenerating, setIsRegenerating] = useState(false);

  const isOwner = currentOrganization?.created_by === user?.id;

  const handleDeleteOrg = async () => {
    if (window.confirm('Вы уверены, что хотите удалить организацию? Все данные будут потеряны.')) {
      await deleteOrganization(currentOrganization!.id);
      onClose();
    }
  };

  const handleRegenerateCode = async () => {
    if (window.confirm('Сгенерировать новый код? Старый станет недействительным.')) {
      setIsRegenerating(true);
      await regenerateInviteCode(currentOrganization!.id);
      setIsRegenerating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Информация об организации">
      <div className={styles.section}>
        <strong>Название:</strong>
        <span>{currentOrganization?.name}</span>
      </div>

      {currentOrganization?.description && (
        <div className={styles.section}>
          <strong>Описание:</strong>
          <p>{currentOrganization.description}</p>
        </div>
      )}

      {isOwner && (
        <div className={styles.section}>
          <strong>Код приглашения:</strong>
          <div className={styles.inviteCode}>
            <code>{currentOrganization?.invite_code}</code>
            <Button
              variant="secondary"
              size="small"
              onClick={handleRegenerateCode}
              disabled={!currentOrganization?.invite_code_active || isRegenerating}
            >
              {isRegenerating ? 'Обновление...' : 'Обновить'}
            </Button>
          </div>
        </div>
      )}

      <div className={styles.section}>
        <strong>Участники ({currentOrganization?.members?.length || 0}):</strong>
        <div className={styles.members}>
          {currentOrganization?.members?.map((member) => (
            <div key={member.id} className={styles.member}>
              <div
                className={styles.avatar}
                title={member.full_name || member.email}
              >
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
        <Button variant="secondary" onClick={() => alert('Функция "Выйти" пока не реализована')}>
          Выйти из организации
        </Button>
        {isOwner && (
          <Button variant="danger" onClick={handleDeleteOrg}>
            Удалить организацию
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default OrgInfoModal;
