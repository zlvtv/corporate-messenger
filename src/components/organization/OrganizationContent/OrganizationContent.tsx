// OrganizationContent.tsx
import React, { useState } from 'react';
import { useOrganization } from '../../../context/OrganizationContext';
import { useAuth } from '../../../context/AuthContext';
import styles from './OrganizationContent.module.css';

const getMembersText = (count: number): string => {
  if (count === 1) return '1 участник';
  if (count >= 2 && count <= 4) return `${count} участника`;
  return `${count} участников`;
};

const OrganizationContent: React.FC = () => {
  const { 
    currentOrganization, 
    regenerateInviteCode, 
    deactivateInviteCode,
    deleteOrganization, 
    setCurrentOrganization,
    refreshCurrentOrganization // Добавляем новую функцию
  } = useOrganization();
  
  const { user } = useAuth();
  
  const [isManagingInvite, setIsManagingInvite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!currentOrganization || !user) {
    return null;
  }

  const isOwner = currentOrganization.created_by === user.id;

  const getInviteCodeStatus = () => {
    if (!currentOrganization.is_invite_code_active) {
      return { status: 'deactivated', label: 'Деактивирован', color: '#ef4444' };
    }
    if (currentOrganization.invite_code_expires_at && 
        new Date(currentOrganization.invite_code_expires_at) < new Date()) {
      return { status: 'expired', label: 'Истек', color: '#f59e0b' };
    }
    return { status: 'active', label: 'Активен', color: '#10b981' };
  };

  const codeStatus = getInviteCodeStatus();

  const handleRegenerateCode = async () => {
    if (!isOwner) return;
    
    setIsLoading(true);
    try {
      await regenerateInviteCode(currentOrganization.id);
      // Дополнительно обновляем данные
      await refreshCurrentOrganization();
      setIsManagingInvite(false);
    } catch (error) {
      console.error('Ошибка при генерации кода:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateCode = async () => {
    if (!isOwner) return;
    
    setIsLoading(true);
    try {
      await deactivateInviteCode(currentOrganization.id);
      // Дополнительно обновляем данные
      await refreshCurrentOrganization();
      setIsManagingInvite(false);
    } catch (error) {
      console.error('Ошибка при деактивации кода:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrganization = async () => {
    if (!isOwner) return;
    
    setIsLoading(true);
    try {
      await deleteOrganization(currentOrganization.id);
      setShowDeleteConfirm(false);
      setCurrentOrganization(null);
    } catch (error) {
      console.error('Ошибка при удалении организации:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatExpirationDate = (dateString?: string) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.content}>
      <div className={styles.content__header}>
        <div className={styles.content__headerInfo}>
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
            <p className={styles.content__description}>
              {currentOrganization.description}
            </p>
          )}
          
          <div className={styles.content__meta}>
            {isOwner ? (
              <div className={styles.content__inviteSection}>
                <div className={styles.content__inviteCode}>
                  <span className={styles.inviteCode__label}>Код приглашения:</span>
                  <strong className={styles.inviteCode__value}>
                    {currentOrganization.invite_code || 'Загрузка...'}
                  </strong>
                  <span 
                    className={styles.inviteCode__status}
                    style={{ backgroundColor: codeStatus.color }}
                  >
                    {codeStatus.label}
                  </span>
                  <button 
                    className={styles.inviteCode__manageButton}
                    onClick={() => setIsManagingInvite(!isManagingInvite)}
                    disabled={isLoading}
                  >
                    {isManagingInvite ? 'Отмена' : 'Управление'}
                  </button>
                </div>
                
                {isManagingInvite && (
                  <div className={styles.inviteManagement}>
                    <div className={styles.inviteManagement__info}>
                      <p><strong>Создан:</strong> {formatExpirationDate(currentOrganization.invite_code_generated_at)}</p>
                      <p><strong>Истекает:</strong> {formatExpirationDate(currentOrganization.invite_code_expires_at)}</p>
                      <p><strong>Следующее обновление:</strong> {formatExpirationDate(currentOrganization.next_code_update)}</p>
                      <p className={styles.inviteManagement__note}>
                        Код автоматически обновляется каждый час для безопасности
                      </p>
                    </div>
                    <div className={styles.inviteManagement__actions}>
                      <button 
                        className={`${styles.button} ${styles.buttonSecondary}`}
                        onClick={handleRegenerateCode}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Генерация...' : 'Создать новый код'}
                      </button>
                      <button 
                        className={`${styles.button} ${styles.buttonDanger}`}
                        onClick={handleDeactivateCode}
                        disabled={isLoading || !currentOrganization.is_invite_code_active}
                      >
                        Деактивировать код
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.content__inviteSection}>
                <div className={styles.inviteCode__restricted}>
                  <span>Коды приглашений видны только владельцу организации</span>
                </div>
              </div>
            )}
            
            <span className={styles.content__memberCount}>
              {getMembersText(currentOrganization.organization_members?.length || 0)}
            </span>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteModal}>
            <h3>Удалить организацию</h3>
            <p>Вы уверены, что хотите удалить "<strong>{currentOrganization.name}</strong>"?</p>
            <p className={styles.deleteWarning}>
              Это действие нельзя отменить. Все данные организации будут удалены.
            </p>
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
                onClick={handleDeleteOrganization}
                disabled={isLoading}
              >
                {isLoading ? 'Удаление...' : 'Удалить организацию'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.content__body}>
        <div className={styles.placeholder}>
          <h3>Панель управления организацией</h3>
          <p>Здесь будут отображаться ваши каналы, сообщения и задачи.</p>
          <p>На следующей неделе мы начнем разработку функционала каналов.</p>
          
          <div className={styles.placeholder__features}>
            <div className={styles.feature}>
              <h4>Каналы и темы</h4>
              <p>Организуйте обсуждения по каналам и темам</p>
            </div>
            <div className={styles.feature}>
              <h4>Сообщения в реальном времени</h4>
              <p>Мгновенные сообщения с реакциями и ветками</p>
            </div>
            <div className={styles.feature}>
              <h4>Управление задачами</h4>
              <p>Создавайте и назначайте задачи с дедлайнами</p>
            </div>
            <div className={styles.feature}>
              <h4>Интеграция с календарем</h4>
              <p>Просматривайте все дедлайны в одном месте</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationContent;