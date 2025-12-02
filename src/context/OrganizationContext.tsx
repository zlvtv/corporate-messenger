// src/context/OrganizationContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { organizationService } from '../services/organizationService';
import {
  OrganizationWithMembers,
  CreateOrganizationData,
} from '../types/organization.types';

interface OrganizationContextType {
  organizations: OrganizationWithMembers[];
  currentOrganization: OrganizationWithMembers | null;
  isLoading: boolean;
  error: string | null;
  createOrganization: (data: CreateOrganizationData) => Promise<void>;
  joinOrganization: (inviteCode: string) => Promise<string>;
  setCurrentOrganization: (org: OrganizationWithMembers | null) => void;
  refreshOrganizations: () => Promise<void>;
  refreshCurrentOrganization: () => Promise<void>;
  regenerateInviteCode: (organizationId: string) => Promise<string>;
  deactivateInviteCode: (organizationId: string) => Promise<void>;
  deleteOrganization: (organizationId: string) => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [organizations, setOrganizations] = useState<OrganizationWithMembers[]>([]);
  const [currentOrganization, setCurrentOrganization] =
    useState<OrganizationWithMembers | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrganizations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const orgs = await organizationService.getUserOrganizations();
      setOrganizations(orgs);

      const savedOrgId = localStorage.getItem('currentOrgId');
      const matchedOrg = orgs.find((o) => o.id === savedOrgId) || orgs[0] || null;

      setCurrentOrganization(matchedOrg);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки организаций');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshCurrentOrganization = useCallback(async () => {
    if (!currentOrganization) return;
    try {
      const orgs = await organizationService.getUserOrganizations();
      const updated = orgs.find((o) => o.id === currentOrganization.id);
      if (updated) setCurrentOrganization(updated);
    } catch (err) {
      console.error('Ошибка обновления организации:', err);
    }
  }, [currentOrganization?.id]);

  const createOrganization = async (data: CreateOrganizationData) => {
    setError(null);
    try {
      await organizationService.createOrganization(data);
      await loadOrganizations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания');
      throw err;
    }
  };

  const joinOrganization = async (inviteCode: string) => {
    setError(null);
    try {
      const orgId = await organizationService.joinOrganization(inviteCode);
      await loadOrganizations();
      return orgId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка вступления');
      throw err;
    }
  };

  const deleteOrganization = async (organizationId: string) => {
    setError(null);
    try {
      await organizationService.deleteOrganization(organizationId);
      await loadOrganizations();
      if (currentOrganization?.id === organizationId) {
        setCurrentOrganization(null);
        localStorage.removeItem('currentOrgId');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления');
      throw err;
    }
  };

  const regenerateInviteCode = async (organizationId: string) => {
    try {
      const newCode = await organizationService.regenerateInviteCode(organizationId);
      await refreshCurrentOrganization();
      return newCode;
    } catch (error) {
      setError((error as Error).message);
      throw error;
    }
  };

  const deactivateInviteCode = async (organizationId: string) => {
    try {
      await organizationService.deactivateInviteCode(organizationId);
      await refreshCurrentOrganization();
    } catch (error) {
      setError((error as Error).message);
      throw error;
    }
  };

  const refreshOrganizations = useCallback(() => loadOrganizations(), []);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  useEffect(() => {
    if (currentOrganization) {
      localStorage.setItem('currentOrgId', currentOrganization.id);
    }
  }, [currentOrganization]);

  const value = {
    organizations,
    currentOrganization,
    isLoading,
    error,
    createOrganization,
    joinOrganization,
    setCurrentOrganization,
    refreshOrganizations,
    refreshCurrentOrganization,
    regenerateInviteCode,
    deactivateInviteCode,
    deleteOrganization,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization должен использоваться внутри OrganizationProvider');
  }
  return context;
};