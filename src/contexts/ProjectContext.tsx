// src/contexts/ProjectContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
    // Проверяем, не загружаем ли мы уже для этой организации
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
      
      // Автоматически выбираем первый проект, если нет текущего
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
      
      // Перезагружаем список проектов
      await loadProjects(data.organization_id);
    } catch (err) {
      console.error('Ошибка создания проекта:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (currentProject?.id) {
      loadProjectStatuses(currentProject.id);
    } else {
      setProjectStatuses([]);
    }
  }, [currentProject?.id, loadProjectStatuses]);

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