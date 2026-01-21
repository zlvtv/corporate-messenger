import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useOrganization } from './OrganizationContext';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';  

interface ProjectMember {
  id: string;
  user_id: string;
  role: 'member' | 'moderator' | 'owner';
  joined_at: string;
  profile: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface TaskAssignee {
  task_id: string;
  user_id: string;
  assigned_by: string;
  assigned_at: string;
}

interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  created_at: string;
  created_by: string;
  due_date: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  source_message_id: string | null;
  assignees: TaskAssignee[];
}

interface Project {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by: string;
  members: ProjectMember[];
  tasks: Task[];
}

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  setCurrentProject: (project: Project | null) => void;
  createProject: (name: string, description?: string) => Promise<Project>;
  refreshProjects: () => Promise<Project[]>;
  isMember: (projectId: string) => boolean;
  canManageTasks: (projectId: string) => boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const generateId = () => Date.now().toString();

let MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    organization_id: 'org-1',
    name: 'Веб-платформа',
    description: 'Разработка дашборда',
    created_at: '2025-01-21T09:00:00Z',
    created_by: 'user-1',
    members: [
      {
        id: 'member-1',
        user_id: 'user-1',
        role: 'owner',
        joined_at: '2025-01-21T09:00:00Z',
        profile: {
          id: 'user-1',
          username: 'demo_user',
          full_name: 'Demo User',
          avatar_url: null,
        },
      },
    ],
    tasks: [],
  },
];

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currentOrganization } = useOrganization();
  const { user } = useAuth();

  const fetchProjects = useCallback(async (): Promise<Project[]> => {
    if (!currentOrganization || !user) return [];

    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); 

      const orgProjects = MOCK_PROJECTS.filter(p => p.organization_id === currentOrganization.id);

      setProjects(orgProjects);

      const savedId = localStorage.getItem('currentProjectId');
      const savedProject = orgProjects.find(p => p.id === savedId) || orgProjects[0] || null;
      setCurrentProject(savedProject);

      return orgProjects;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки проектов');
      return [];
    }
  }, [currentOrganization?.id, user?.id]);

  const refreshProjects = useCallback(async () => {
    return await fetchProjects();
  }, [fetchProjects]);

  const createProject = async (name: string, description?: string): Promise<Project> => {
    if (!currentOrganization || !user) throw new Error('Нет доступа');

    await new Promise(resolve => setTimeout(resolve, 600));

    const newProject: Project = {
      id: 'proj-' + generateId(),
      organization_id: currentOrganization.id,
      name,
      description: description || null,
      created_at: new Date().toISOString(),
      created_by: user.id,
      members: [
        {
          id: 'member-' + generateId(),
          user_id: user.id,
          role: 'owner',
          joined_at: new Date().toISOString(),
          profile: {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
          },
        },
      ],
      tasks: [],
    };

    MOCK_PROJECTS.push(newProject);
    setProjects(prev => [newProject, ...prev]);
    setCurrentProject(newProject);
    localStorage.setItem('currentProjectId', newProject.id);

    return newProject;
  };

  const isMember = (projectId: string) => {
    return projects.some(p => p.id === projectId);
  };

  const canManageTasks = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    const member = project?.members.find(m => m.user_id === user?.id);
    return member?.role === 'owner' || member?.role === 'moderator';
  };

  useEffect(() => {
    if (currentOrganization) {
      fetchProjects().finally(() => setIsLoading(false));
    } else {
      setProjects([]);
      setCurrentProject(null);
      setIsLoading(false);
    }
  }, [currentOrganization?.id]);

  useEffect(() => {
    if (currentProject) {
      localStorage.setItem('currentProjectId', currentProject.id);
    }
  }, [currentProject]);

  const value: ProjectContextType = {
    projects,
    currentProject,
    isLoading,
    error,
    setCurrentProject,
    createProject,
    refreshProjects,
    isMember,
    canManageTasks,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within ProjectProvider');
  return context;
};
