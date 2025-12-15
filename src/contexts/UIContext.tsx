// src/contexts/UIContext.tsx
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

type UIContextType = {
  theme: 'light' | 'dark';
  isSearchOpen: boolean;
  isProfileOpen: boolean;
  isOrgInfoOpen: boolean;
  isCreateProjectOpen: boolean;
  chatWidth: number;
  isBoardFullscreen: boolean;
  selectedOrgId: string | null;
  selectedProjectId: string | null;
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
};

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOrgInfoOpen, setIsOrgInfoOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [chatWidth, setChatWidthState] = useState(400);
  const [isBoardFullscreen, setIsBoardFullscreen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Синхронизация с localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  // Применяем тему к body
  useEffect(() => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('theme', theme);
  console.log('🎨 [UI] Тема применена:', theme);
}, [theme]);

  const setChatWidth = useCallback((width: number) => {
    setChatWidthState(Math.max(300, Math.min(width, 800)));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
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
    setIsBoardFullscreen(prev => !prev);
  }, []);

  const selectOrg = useCallback((id: string) => {
    setSelectedOrgId(id);
  }, []);

  const selectProject = useCallback((id: string) => {
    setSelectedProjectId(id);
  }, []);

  const value = useMemo<UIContextType>(() => ({
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
    setChatWidth,
    toggleFullscreen,
    selectOrg,
    selectProject,
  }), [
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
    setChatWidth,
    toggleFullscreen,
    selectOrg,
    selectProject,
  ]);

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};
