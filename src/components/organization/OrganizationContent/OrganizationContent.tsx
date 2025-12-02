// src/components/organization/OrganizationContent/OrganizationContent.tsx
import React, { useState } from 'react';
import { useOrganization } from '../../../context/OrganizationContext';
import { useAuth } from '../../../context/AuthContext';
import ProjectSidebar from '../../project/ProjectSidebar/ProjectSidebar';
import ProjectContent from '../../project/ProjectContent/ProjectContent';
import styles from './OrganizationContent.module.css';

const getMembersText = (count: number): string => {
  if (count === 1) return '1 участник';
  if (count >= 2 && count <= 4) return `${count} участника`;
  return `${count} участников`;
};

interface OrganizationContentProps {
  onOpenCreateProjectModal: () => void;
}

const OrganizationContent: React.FC<OrganizationContentProps> = ({
  onOpenCreateProjectModal,
}) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false); // ✅ Новое состояние
  const [isManagingInvite, setIsManagingInvite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    currentOrganization,
    regenerateInviteCode,
    deactivateInviteCode,
    deleteOrganization,
    setCurrentOrganization,
    refreshCurrentOrganization,
  } = useOrganization();
  const { user } = useAuth();

  if (!currentOrganization || !user) return null;

  const isOwner = currentOrganization.created_by === user.id;

  const codeStatus = (() => {
    if (!currentOrganization.is_invite_code_active)
      return { label: 'Деактивирован', color: '#ef4444' };
    if (
      currentOrganization.invite_code_expires_at &&
      new Date(currentOrganization.invite_code_expires_at) < new Date()
    )
      return { label: 'Истек', color: '#f59e0b' };
    return { label: 'Активен', color: '#10b981' };
  })();

  const format = (dateString?: string) =>
    dateString
      ? new Date(dateString).toLocaleString('ru-RU', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';

  const handleRegenerate = async () => {
    if (!isOwner || isLoading) return;
    setIsLoading(true);
    try {
      await regenerateInviteCode(currentOrganization.id);
      await refreshCurrentOrganization();
      setIsManagingInvite(false);
    } catch (err) {
      console.error('Ошибка:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!isOwner || isLoading) return;
    setIsLoading(true);
    try {
      await deactivateInviteCode(currentOrganization.id);
      await refreshCurrentOrganization();
      setIsManagingInvite(false);
    } catch (err) {
      console.error('Ошибка:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner || isLoading) return;
    setIsLoading(true);
    try {
      await deleteOrganization(currentOrganization.id);
      setCurrentOrganization(null);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Ошибка:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.content}>
      <header className={styles.content__header}>
        <div className={styles.content__titleRow}>
          <h1 className={styles.content__title}>{currentOrganization.name}</h1>
          {isOwner && (
            <button
              className={styles.deleteOrganizationButton}
              onClick={() => setShowDeleteConfirm(true)}
              title="Удалить организацию"
            >
              ×
            </button>
          )}
        </div>
        {currentOrganization.description && (
          <p className={styles.content__description}>{currentOrganization.description}</p>
        )}
        {/* Кнопка информации — в правом верхнем углу */}
      <button
        className={styles.infoButton}
        onClick={() => setIsInfoOpen(true)}
        title="Информация об организации"
      >
        ℹ️
      </button>
        <div className={styles.content__meta}>
          {isOwner ? (
            <div className={styles.content__inviteSection}>
              <div className={styles.content__inviteCode}>
                <span>Код:</span>
                <strong>{currentOrganization.invite_code || '...'}</strong>
                <span
                  className={styles.inviteCode__status}
                  style={{ backgroundColor: codeStatus.color }}
                >
                  {codeStatus.label}
                </span>
                <button
                  className={styles.inviteCode__manageButton}
                  onClick={() => setIsManagingInvite((prev) => !prev)}
                  disabled={isLoading}
                >
                  {isManagingInvite ? 'Отмена' : 'Управление'}
                </button>
              </div>

              {isManagingInvite && (
                <div className={styles.inviteManagement}>
                  <small>
                    Создан: {format(currentOrganization.invite_code_generated_at)}
                    <br />
                    Истекает: {format(currentOrganization.invite_code_expires_at)}
                  </small>
                  <p className={styles.inviteManagement__note}>
                    Код обновляется каждый час
                  </p>
                  <div className={styles.inviteManagement__actions}>
                    <button
                      className={styles.buttonSecondary}
                      onClick={handleRegenerate}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Генерация...' : 'Новый код'}
                    </button>
                    <button
                      className={styles.buttonDanger}
                      onClick={handleDeactivate}
                      disabled={isLoading || !currentOrganization.is_invite_code_active}
                    >
                      Деактивировать
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <span className={styles.inviteCode__restricted}>
              Коды доступны только владельцу
            </span>
          )}
          <span className={styles.content__memberCount}>
            {getMembersText(currentOrganization.organization_members.length)}
          </span>
        </div>
      </header>

      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteModal}>
            <h3>Удалить организацию?</h3>
            <p>Организация "{currentOrganization.name}" будет удалена навсегда.</p>
            <p className={styles.deleteWarning}>Данные нельзя восстановить.</p>
            <div className={styles.deleteModalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
              >
                Отмена
              </button>
              <button
                className={styles.confirmDeleteButton}
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Модальное окно с информацией */}
    {isInfoOpen && (
      <div className={styles.infoModalOverlay}>
        <div className={styles.infoModal}>
          <div className={styles.infoModalHeader}>
            <h3>Информация об организации</h3>
            <button
              onClick={() => setIsInfoOpen(false)}
              className={styles.infoModalClose}
            >
              ×
            </button>
          </div>

          <div className={styles.infoModalBody}>
            {currentOrganization.description && (
              <div className={styles.infoSection}>
                <strong>Описание</strong>
                <p>{currentOrganization.description}</p>
              </div>
            )}

            <div className={styles.infoSection}>
              <strong>Участники</strong>
              <p>{getMembersText(currentOrganization.organization_members.length)}</p>
            </div>

            {isOwner ? (
              <div className={styles.infoSection}>
                <strong>Код приглашения</strong>
                <div className={styles.content__inviteCode}>
                  <span>{currentOrganization.invite_code || '...'}</span>
                  <span
                    className={styles.inviteCode__status}
                    style={{ backgroundColor: codeStatus.color }}
                  >
                    {codeStatus.label}
                  </span>
                </div>

                <small>
                  Создан: {format(currentOrganization.invite_code_generated_at)}
                </small>
                <br />
                <small>
                  Истекает: {format(currentOrganization.invite_code_expires_at)}
                </small>

                <button
                  className={styles.inviteCode__manageButton}
                  onClick={() => setIsManagingInvite((prev) => !prev)}
                  disabled={isLoading}
                  style={{ marginTop: '8px' }}
                >
                  {isManagingInvite ? 'Отмена' : 'Управление'}
                </button>

                {isManagingInvite && (
                  <div className={styles.inviteManagement}>
                    <div className={styles.inviteManagement__actions}>
                      <button
                        className={styles.buttonSecondary}
                        onClick={handleRegenerate}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Генерация...' : 'Новый код'}
                      </button>
                      <button
                        className={styles.buttonDanger}
                        onClick={handleDeactivate}
                        disabled={isLoading || !currentOrganization.is_invite_code_active}
                      >
                        Деактивировать
                      </button>
                    </div>
                    <p className={styles.inviteManagement__note}>
                      Код обновляется каждый час
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.infoSection}>
                <em>Код приглашения доступен только владельцу</em>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
      <main className={styles.content__body}>
        <ProjectSidebar onOpenCreateProjectModal={onOpenCreateProjectModal} />
        <ProjectContent />
      </main>
    </div>
  );
};

export default OrganizationContent;