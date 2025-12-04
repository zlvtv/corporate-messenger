// src/pages/Dashboard/Dashboard.tsx
import React from 'react';
import OrgIconPanel from '../../components/org-icon-panel/org-icon-panel';
import SettingsPanel from '../../components/settings-panel/settings-panel';
import MainHeader from '../../components/main-header/main-header';
import ChatHeader from '../../components/chat-header/chat-header';
import ProjectChat from '../../components/chat/project-chat/project-chat';
import TaskBoard from '../../components/task-board/task-board';
import ResizableSplitter from '../../components/resizable-splitter/resizable-splitter';
import styles from './Dashboard.module.css';
import { useUI } from '../../contexts/UIContext';
import { useOrganization } from '../../contexts/OrganizationContext';
import { useProject } from '../../contexts/ProjectContext';

const Dashboard: React.FC = () => {
  const { isBoardFullscreen, theme, chatWidth } = useUI();
  const { currentOrganization } = useOrganization();
  const { currentProject } = useProject();

  if (!currentOrganization) {
    return (
      <div className={styles.dashboard}>
        <p>Выберите организацию</p>
      </div>
    );
  }

  return (
    <div className={`${styles.dashboard} ${theme}`}>
      <OrgIconPanel />
      <SettingsPanel />

      <main className={styles['dashboard__main']}>
        <MainHeader />
        <ChatHeader />

        {!isBoardFullscreen ? (
          <div className={styles['dashboard__content']}>
            <div
              className={styles['dashboard__chat']}
              style={{ width: `${chatWidth}px` }}
            >
              <ProjectChat />
            </div>
            <ResizableSplitter />
            <div className={styles['dashboard__board']}>
              <TaskBoard />
            </div>
          </div>
        ) : (
          <div className={styles['dashboard__fullscreen']}>
            <TaskBoard />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
