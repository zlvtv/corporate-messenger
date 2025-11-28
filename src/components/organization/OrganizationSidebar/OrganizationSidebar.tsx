// src/components/organization/OrganizationSidebar/OrganizationSidebar.tsx
import React from 'react';
import { useOrganization } from '../../../context/OrganizationContext';
import Button from '../../ui/Button/Button';
import styles from './OrganizationSidebar.module.css';

interface OrganizationSidebarProps {
  onOpenCreateModal: () => void;
  onOpenJoinModal: () => void;
}

const getMembersText = (count: number): string => {
  if (count === 1) return '1 участник';
  if (count >= 2 && count <= 4) return `${count} участника`;
  return `${count} участников`;
};

const OrganizationSidebar: React.FC<OrganizationSidebarProps> = ({
  onOpenCreateModal,
  onOpenJoinModal,
}) => {
  const { organizations, currentOrganization, setCurrentOrganization, isLoading } = useOrganization();

  if (isLoading) {
    return (
      <div className={styles.sidebar}>
        <div className={styles.sidebar__loading}>Загрузка организаций...</div>
      </div>
    );
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebar__header}>
        <h2 className={styles.sidebar__title}>Организации</h2>
        <div className={styles.sidebar__actions}>
          <Button
            variant="primary"
            onClick={onOpenCreateModal}
            className={styles.sidebar__button}
            size="small"
          >
            Создать
          </Button>
          <Button
            variant="secondary"
            onClick={onOpenJoinModal}
            className={styles.sidebar__button}
            size="small"
          >
            Вступить
          </Button>
        </div>
      </div>

      <div className={styles.sidebar__content}>
        {organizations.length === 0 ? (
          <div className={styles.sidebar__empty}>
            <p>Нет организаций</p>
            <p className={styles.sidebar__emptyHint}>
              Создайте свою первую организацию или вступите в существующую
            </p>
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
                <div className={styles.organizationItem__info}>
                  <div className={styles.organizationItem__name}>
                    {org.name}
                  </div>
                  <div className={styles.organizationItem__members}>
                    {getMembersText(org.organization_members?.length || 0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationSidebar;