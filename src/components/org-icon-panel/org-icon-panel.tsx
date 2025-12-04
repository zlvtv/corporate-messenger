// src/components/org-icon-panel/org-icon-panel.tsx
import React, { useState } from 'react';
import { useOrganization } from '../../contexts/OrganizationContext';
import { useUI } from '../../contexts/UIContext';
import SearchModal from '../../components/modals/search-modal/search-modal';
import styles from './org-icon-panel.module.css';
import { createPortal } from 'react-dom';

const OrgIconPanel: React.FC = () => {
  const { organizations, currentOrganization, setCurrentOrganization } = useOrganization();
  const { openSearch } = useUI();
  const [searchAnchor, setSearchAnchor] = useState<HTMLElement | null>(null);

  const handleSearchClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setSearchAnchor(e.currentTarget);
    openSearch();
  };

  const handleOrgClick = (org: (typeof organizations)[0]) => {
    setCurrentOrganization(org);
  };

  return (
    <>
      <div className={styles['org-icon-panel']}>
        {/* Кнопка поиска */}
        <button
          className={styles['org-icon-panel__search-btn']}
          onClick={handleSearchClick}
          aria-label="Поиск по чатам"
        >
          🔍
        </button>

        {/* Иконки организаций */}
        <div className={styles['org-icon-panel__orgs']}>
          {organizations.map((org) => {
            const firstLetter = org.name?.charAt(0).toUpperCase() || 'O';
            return (
              <button
                key={org.id}
                className={`${styles['org-icon-panel__org-btn']} ${
                  currentOrganization?.id === org.id ? styles['org-icon-panel__org-btn--active'] : ''
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

      {/* Модалка поиска — рендерится рядом с кнопкой */}
      {searchAnchor &&
        createPortal(
          <SearchModal anchorEl={searchAnchor} />,
          document.body
        )}
    </>
  );
};

export default OrgIconPanel;
