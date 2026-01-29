import React, { useState, useMemo } from 'react';
import styles from './task-board.module.css';
import { useProject } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import TaskCard from '../task-card/task-card';
import Button from '../ui/button/button';
import Select from '../ui/select/select';
import CalendarView from '../calendar-view/calendar-view';

const TaskBoard: React.FC = () => {
  const { currentProject, refreshProjects } = useProject();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'my' | 'project' | 'calendar'>('my');

  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });

  if (!currentProject) {
    return <div className={styles.placeholder}>Выберите проект</div>;
  }

  const tasks = currentProject.tasks;

  const assigneesMap = useMemo(() => {
    const map: { [key: string]: any[] } = {};
    tasks.forEach(task => {
      map[task.id] = currentProject.members
        .filter(m => task.assignees.includes(m.user_id))
        .map(m => m.profile);
    });
    return map;
  }, [tasks, currentProject.members]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = !filters.status || task.status === filters.status;
      const matchesPriority = !filters.priority || task.priority === filters.priority;
      const isMyTask = activeTab === 'my' ? task.assignees.includes(user?.id) : true;
      return matchesSearch && matchesStatus && matchesPriority && isMyTask;
    });
  }, [tasks, filters, activeTab, user?.id]);

  const tabs = [
    { id: 'my', label: 'Мои задачи' },
    { id: 'project', label: 'Проект' },
    { id: 'calendar', label: 'Календарь' },
  ];

  return (
    <div className={styles.board}>
      <div className={styles.header}>
        <h3>Задачи</h3>

        <div className={styles.tabs}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.controls}>
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            className={styles.search}
          />

          <Select
            value={filters.status}
            onChange={value => setFilters({ ...filters, status: value as string })}
            options={[
              { value: '', label: 'Все статусы' },
              { value: 'todo', label: 'Не начата' },
              { value: 'in_progress', label: 'В процессе' },
              { value: 'done', label: 'Готово' },
            ]}
            placeholder="Статус"
            className={styles.filter}
          />

          <Select
            value={filters.priority}
            onChange={value => setFilters({ ...filters, priority: value as string })}
            options={[
              { value: '', label: 'Все приоритеты' },
              { value: 'low', label: 'Низкий' },
              { value: 'medium', label: 'Средний' },
              { value: 'high', label: 'Высокий' },
            ]}
            placeholder="Приоритет"
            className={styles.filter}
          />
        </div>
      </div>

      {activeTab === 'calendar' ? (
        <CalendarView tasks={filteredTasks} assignees={assigneesMap} />
      ) : (
        <div className={styles.taskList}>
          {filteredTasks.length === 0 ? (
            <div className={styles.noTasks}>Нет задач по заданным фильтрам</div>
          ) : (
            filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                assignees={assigneesMap[task.id] || []}
                onStatusChange={async newStatus => {
                  console.log('Обновление статуса:', newStatus);
                }}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
