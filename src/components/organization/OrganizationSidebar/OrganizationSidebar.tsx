// src/components/organization/OrganizationSidebar/OrganizationSidebar.tsx
import React from 'react';
import { useOrganization } from '../../../context/OrganizationContext';
import Button from '../../ui/Button/Button';
import { useUI } from '../../../context/UIContext'; // ✅ Импортируем
import styles from './OrganizationSidebar.module.css';

const getMembersText = (count: number): string => {
  if (count === 1) return '1 участник';
  if (count >= 2 && count <= 4) return `${count} участника`;
  return `${count} участников`;
};

interface OrganizationSidebarProps {
  onOpenCreateModal: () => void;
  onOpenJoinModal: () => void;
}

const OrganizationSidebar: React.FC<OrganizationSidebarProps> = ({
  onOpenCreateModal,
  onOpenJoinModal,
}) => {
  const { organizations, currentOrganization, setCurrentOrganization, isLoading } =
    useOrganization();
  const { isSidebarCollapsed, toggleSidebar } = useUI(); // ✅ Подключаем

  if (isLoading) {
    return (
      <div className={`${styles.sidebar} ${isSidebarCollapsed ? styles['sidebar--collapsed'] : ''}`}>
        <div className={styles.sidebar__loading}>Загрузка...</div>
      </div>
    );
  }

  return (
    <div className={`${styles.sidebar} ${isSidebarCollapsed ? styles['sidebar--collapsed'] : ''}`}>
      <div className={styles.sidebar__header}>
        <h2 className={styles.sidebar__title}>Организации</h2>
        {!isSidebarCollapsed && (
          <div className={styles.sidebar__actions}>
            <Button variant="primary" size="small" onClick={onOpenCreateModal}>
              Создать
            </Button>
            <Button variant="secondary" size="small" onClick={onOpenJoinModal}>
              Вступить
            </Button>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={styles.sidebar__toggleButton}
          title={isSidebarCollapsed ? 'Развернуть' : 'Свернуть'}
        >
          {isSidebarCollapsed ? '→' : '←'}
        </button>
      </div>

      <div className={styles.sidebar__content}>
        {organizations.length === 0 ? (
          <div className={styles.sidebar__empty}>
            <p>Нет организаций</p>
            <p className={styles.sidebar__emptyHint}>Создайте или вступите</p>
          </div>
        ) : (
          <div className={styles.organizationList}>
            {organizations.map((org) => (
              <div
                key={org.id}
                className={`${styles.organizationItem} ${
                  currentOrganization?.id === org.id ? styles['organizationItem--active'] : ''
                }`}
                onClick={() => setCurrentOrganization(org)}
              >
                <div className={styles.organizationItem__avatar}>
                  {org.name.charAt(0).toUpperCase()}
                </div>
                {!isSidebarCollapsed && (
                  <div className={styles.organizationItem__info}>
                    <div className={styles.organizationItem__name}>{org.name}</div>
                    <div className={styles.organizationItem__members}>
                      {getMembersText(org.organization_members?.length || 0)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationSidebar;