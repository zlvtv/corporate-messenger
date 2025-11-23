// src/contexts/OrganizationContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { organizationService } from '../services/organizationService';
import { Organization, OrganizationWithMembers, CreateOrganizationData } from '../types/organization.types';

interface OrganizationContextType {
  organizations: OrganizationWithMembers[];
  currentOrganization: OrganizationWithMembers | null;
  isLoading: boolean;
  error: string | null;
  createOrganization: (data: CreateOrganizationData) => Promise<void>;
  joinOrganization: (inviteCode: string) => Promise<void>;
  setCurrentOrganization: (org: OrganizationWithMembers | null) => void;
  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organizations, setOrganizations] = useState<OrganizationWithMembers[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<OrganizationWithMembers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userOrganizations = await organizationService.getUserOrganizations();
      setOrganizations(userOrganizations);
      
      // Автоматически выбираем первую организацию, если нет текущей
      if (userOrganizations.length > 0 && !currentOrganization) {
        setCurrentOrganization(userOrganizations[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateInviteCode = async (organizationId: string): Promise<string> => {
  try {
    const newCode = await organizationService.regenerateInviteCode(organizationId);
    await loadOrganizations(); // Обновляем список
    return newCode;
  } catch (error) {
    console.error('Error regenerating invite code:', error);
    throw error;
  }
};

const deactivateInviteCode = async (organizationId: string): Promise<void> => {
  try {
    await organizationService.deactivateInviteCode(organizationId);
    await loadOrganizations(); // Обновляем список
  } catch (error) {
    console.error('Error deactivating invite code:', error);
    throw error;
  }
};

  useEffect(() => {
    loadOrganizations();
  }, []);

  const createOrganization = async (data: CreateOrganizationData) => {
    try {
      setError(null);
      await organizationService.createOrganization(data);
      await loadOrganizations(); // Перезагружаем список организаций
    } catch (err) {
      throw err;
    }
  };

  const joinOrganization = async (inviteCode: string): Promise<string> => {
  try {
    // Возвращаем ID присоединенной организации
    const organizationId = await organizationService.joinOrganization(inviteCode);
    
    // Обновляем список организаций
    await loadOrganizations();
    
    // Возвращаем ID для установки фокуса
    return organizationId;
  } catch (error) {
    console.error('Error joining organization:', error);
    throw error;
  }

};

  const refreshOrganizations = async () => {
    await loadOrganizations();
  };

  const value = {
    organizations,
    currentOrganization,
    isLoading,
    error,
    createOrganization,
    joinOrganization,
    setCurrentOrganization,
    regenerateInviteCode, // ← Добавьте это
    deactivateInviteCode,
    refreshOrganizations,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};