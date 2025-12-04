// src/components/chat-header/chat-header.tsx
import React from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { useUI } from '../../contexts/UIContext';
import CreateProjectModal from '../../components/modals/create-project-modal/create-project-modal';
import styles from './chat-header.module.css';
import { createPortal } from 'react-dom';

const ChatHeader: React.FC = () => {
  const { projects } = useProject();
  const { isCreateProjectOpen, openCreateProject, closeCreateProject } = useUI();

  const [addBtnEl, setAddBtnEl] = React.useState<HTMLButtonElement | null>(null);

  const handleAddClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAddBtnEl(e.currentTarget);
    openCreateProject();
  };

  return (
    <>
      <div className={styles['chat-header']}>
        <div className={styles['chat-header__tabs']}>
          <div className={styles['chat-header__tab']}>Общий</div>
          {projects.map((project) => (
            <div key={project.id} className={styles['chat-header__tab']}>
              {project.name}
            </div>
          ))}
        </div>

        <button
          ref={setAddBtnEl}
          className={styles['chat-header__add-btn']}
          onClick={handleAddClick}
          aria-label="Создать проект"
        >
          +
        </button>
      </div>

      {/* Модалка создания проекта — рядом с кнопкой */}
      {isCreateProjectOpen && addBtnEl &&
        createPortal(
          <CreateProjectModal anchorEl={addBtnEl} onClose={closeCreateProject} />,
          document.body
        )}
    </>
  );
};

export default ChatHeader;
