// src/contexts/ProjectContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; // ✅ Добавлен импорт
import { projectService } from '../services/projectService';
import { Project, TaskStatus, CreateProjectData } from '../types/project.types';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  projectStatuses: TaskStatus[];
  isLoading: boolean;
  error: string | null;
  createProject: (data: CreateProjectData) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  loadProjects: (organizationId: string) => Promise<void>;
  loadProjectStatuses: (projectId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectStatuses, setProjectStatuses] = useState<TaskStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLoadedOrgId, setLastLoadedOrgId] = useState<string | null>(null);

  const loadProjects = useCallback(async (organizationId: string) => {
    if (lastLoadedOrgId === organizationId) {
      console.log('Проекты уже загружены для организации:', organizationId);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Начинаем загрузку проектов для организации:', organizationId);
      const organizationProjects = await projectService.getOrganizationProjects(organizationId);
      console.log('Загружены проекты:', organizationProjects);

      setProjects(organizationProjects);
      setLastLoadedOrgId(organizationId);

      if (organizationProjects.length > 0 && !currentProject) {
        setCurrentProject(organizationProjects[0]);
      } else if (organizationProjects.length === 0) {
        setCurrentProject(null);
      }
    } catch (err) {
      console.error('Ошибка загрузки проектов:', err);
      setError(err instanceof Error ? err.message : 'Failed to load projects');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [lastLoadedOrgId, currentProject]);

  const loadProjectStatuses = useCallback(async (projectId: string) => {
    if (!projectId) return;

    try {
      console.log('Загружаем статусы для проекта:', projectId);
      const statuses = await projectService.getProjectStatuses(projectId);
      console.log('Загружены статусы:', statuses);

      setProjectStatuses(statuses);
    } catch (err) {
      console.error('Ошибка загрузки статусов:', err);
      setProjectStatuses([]);
    }
  }, []);

  const createProject = async (data: CreateProjectData) => {
    try {
      setError(null);
      console.log('Создаем проект:', data);
      await projectService.createProject(data);

      await loadProjects(data.organization_id);
    } catch (err) {
      console.error('Ошибка создания проекта:', err);
      throw err;
    }
  };

  // ✅ Подписка на изменения задач в текущем проекте
  useEffect(() => {
    const projectId = currentProject?.id;
    if (!projectId) return;

    const channel = supabase
      .channel(`tasks-changes-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('Новая задача:', payload.new);
          // Здесь можно обновить состояние при необходимости
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('Задача обновлена:', payload.new);
          // Обнови кэш или UI, если нужно
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('Задача удалена:', payload.old);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentProject?.id]); // ✅ Зависимость — только id текущего проекта

  const value = {
    projects,
    currentProject,
    projectStatuses,
    isLoading,
    error,
    createProject,
    setCurrentProject,
    loadProjects,
    loadProjectStatuses,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
