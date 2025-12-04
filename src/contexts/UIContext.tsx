// src/contexts/UIContext.tsx
import { createContext, useContext, ReactNode, useState, useCallback } from 'react';

interface UIState {
  theme: 'light' | 'dark';
  isSearchOpen: boolean;
  isProfileOpen: boolean;
  isOrgInfoOpen: boolean;
  isCreateProjectOpen: boolean;
  chatWidth: number;
  isBoardFullscreen: boolean;
  selectedOrgId: string | null;
  selectedProjectId: string | null;
}

interface UIContextType extends UIState {
  toggleTheme: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openProfile: () => void;
  closeProfile: () => void;
  openOrgInfo: () => void;
  closeOrgInfo: () => void;
  openCreateProject: () => void;
  closeCreateProject: () => void;
  setChatWidth: (width: number) => void;
  toggleFullscreen: () => void;
  selectOrg: (id: string) => void;
  selectProject: (id: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOrgInfoOpen, setIsOrgInfoOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [chatWidth, setChatWidth] = useState(400);
  const [isBoardFullscreen, setIsBoardFullscreen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  const openProfile = useCallback(() => setIsProfileOpen(true), []);
  const closeProfile = useCallback(() => setIsProfileOpen(false), []);

  const openOrgInfo = useCallback(() => setIsOrgInfoOpen(true), []);
  const closeOrgInfo = useCallback(() => setIsOrgInfoOpen(false), []);

  const openCreateProject = useCallback(() => setIsCreateProjectOpen(true), []);
  const closeCreateProject = useCallback(() => setIsCreateProjectOpen(false), []);

  const toggleFullscreen = useCallback(() => {
    setIsBoardFullscreen((prev) => !prev);
  }, []);

  const selectOrg = useCallback((id: string) => {
    setSelectedOrgId(id);
  }, []);

  const selectProject = useCallback((id: string) => {
    setSelectedProjectId(id);
  }, []);

  const value: UIContextType = {
    theme,
    isSearchOpen,
    isProfileOpen,
    isOrgInfoOpen,
    isCreateProjectOpen,
    chatWidth,
    isBoardFullscreen,
    selectedOrgId,
    selectedProjectId,
    toggleTheme,
    openSearch,
    closeSearch,
    openProfile,
    closeProfile,
    openOrgInfo,
    closeOrgInfo,
    openCreateProject,
    closeCreateProject,
    setChatWidth: (width: number) => setChatWidth(Math.max(300, Math.min(width, 800))),
    toggleFullscreen,
    selectOrg,
    selectProject,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};
