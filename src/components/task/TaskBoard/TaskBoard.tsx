// src/components/task/TaskBoard/TaskBoard.tsx
import React from 'react';
import { useProject } from '../../../contexts/ProjectContext';
import TaskColumn from '../TaskColumn/TaskColumn';
import styles from './TaskBoard.module.css';

const TaskBoard: React.FC = () => {
  const { projectStatuses } = useProject();

  if (!projectStatuses.length) {
    return (
      <div className={styles.board}>
        <div className={styles.board__empty}>
          <h3>Нет статусов</h3>
          <p>Статусы задач появятся после создания проекта</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.board} aria-label="Доска задач">
      <div className={styles.board__columns} role="list">
        {projectStatuses.map((status) => (
          <div key={status.id} role="listitem">
            <TaskColumn
              status={status}
              onAddTask={() => console.log(`Добавление задачи в статус: ${status.name}`)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskBoard;