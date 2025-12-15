// src/components/org-icon-panel/org-icon-panel.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useOrganization } from '../../contexts/OrganizationContext';
import SearchModal from '../../components/modals/search-modal/search-modal';
import CreateOrganizationModal from '../../components/modals/create-organization-modal/create-organization-modal';
import { createPortal } from 'react-dom';
import styles from './org-icon-panel.module.css';

const OrgIconPanel: React.FC = () => {
  const {
    organizations,
    currentOrganization,
    setCurrentOrganization,
    lastCreatedOrgName,
    setLastCreatedOrgName,
  } = useOrganization();

  const [searchAnchor, setSearchAnchor] = useState<HTMLElement | null>(null);
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);
  const orgsRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false); // ← трекаем hover

  const handleSearchClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setSearchAnchor(e.currentTarget);
  };

  const handleOrgClick = (org: (typeof organizations)[0]) => {
    setCurrentOrganization(org);
  };

  // При наведении
  const handleMouseEnter = () => {
    isHovered.current = true;
  };

  // При уходе
  const handleMouseLeave = () => {
    isHovered.current = false;
  };

  // Глобальный обработчик колеса
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isHovered.current) return;
      const container = orgsRef.current;
      if (!container) return;

      e.preventDefault();
      container.scrollTop += e.deltaY;
    };

    // Добавляем слушатель
    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Автопереход на новую организацию
  useEffect(() => {
    if (lastCreatedOrgName && organizations.length > 0) {
      const newOrg = organizations.find((org) => org.name === lastCreatedOrgName);
      if (newOrg && newOrg.id !== currentOrganization?.id) {
        setCurrentOrganization(newOrg);
        setLastCreatedOrgName(null);
      }
    }
  }, [organizations, lastCreatedOrgName, currentOrganization, setCurrentOrganization, setLastCreatedOrgName]);

  return (
    <>
      <div
        className={styles['org-icon-panel']}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Кнопка поиска */}
        <button
          className={styles['org-icon-panel__search-btn']}
          onClick={handleSearchClick}
          aria-label="Поиск по чатам"
        >
          🔍
        </button>

        {/* Кнопка создания */}
        <button
          className={styles['org-icon-panel__create-org-btn']}
          onClick={() => setIsCreateOrgModalOpen(true)}
          aria-label="Создать организацию"
          title="Создать организацию"
        >
          +
        </button>

        {/* Контейнер с иконками — с прокруткой */}
        <div
          ref={orgsRef}
          className={styles['org-icon-panel__orgs']}
          role="region"
          aria-label="Список организаций"
        >
          {organizations.map((org) => {
            const firstLetter = org.name?.charAt(0).toUpperCase() || 'O';
            return (
              <button
                key={org.id}
                className={`${styles['org-icon-panel__org-btn']} ${
                  currentOrganization?.id === org.id
                    ? styles['org-icon-panel__org-btn--active']
                    : ''
                }`}
                onClick={() => handleOrgClick(org)}
                aria-label={org.name}
                title={org.name}
              >
                {firstLetter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Модалки */}
      {searchAnchor &&
        createPortal(
          <SearchModal anchorEl={searchAnchor} onClose={() => setSearchAnchor(null)} />,
          document.body
        )}

      <CreateOrganizationModal
        isOpen={isCreateOrgModalOpen}
        onClose={() => setIsCreateOrgModalOpen(false)}
      />
    </>
  );
};

export default OrgIconPanel;
