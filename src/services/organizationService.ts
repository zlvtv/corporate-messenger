// src/services/organizationService.ts
import { supabase } from '../lib/supabase';
import {
  Organization,
  OrganizationWithMembers,
  CreateOrganizationData,
} from '../types/organization.types';

export const organizationService = {
  // Получение организаций
  async getUserOrganizations(): Promise<OrganizationWithMembers[]> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Не удалось получить данные пользователя');
    }

    const { data, error } = await supabase.rpc('get_user_organizations_with_members');

    if (error) {
      console.error('RPC error (get_user_organizations):', error);
      throw new Error(`Ошибка загрузки организаций: ${error.message}`);
    }

    return (data as OrganizationWithMembers[]) || [];
  },

  // Вступление через код
  async joinOrganization(inviteCode: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не аутентифицирован');

    const cleanInviteCode = inviteCode.trim().toUpperCase();

    const { data: orgId, error } = await supabase.rpc('join_organization_by_invite', {
      p_invite_code: cleanInviteCode,
    });

    if (error) {
      if (error.code === 'PGRST16') throw new Error('Неверный код приглашения');
      throw new Error(`Не удалось вступить: ${error.message}`);
    }

    return orgId;
  },

  // Создание организации
  async createOrganization(data: CreateOrganizationData): Promise<Organization> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не аутентифицирован');

    const { data: orgId, error: rpcError } = await supabase.rpc('create_organization_with_owner', {
      org_name: data.name,
      org_description: data.description || null,
    });

    if (rpcError || !orgId) {
      throw new Error(rpcError?.message || 'Ошибка создания организации');
    }

    const { data: org, error: fetchError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();

    if (fetchError) {
      console.warn('Не удалось загрузить организацию после создания, используем fallback');
      return {
        id: orgId,
        name: data.name,
        description: data.description,
        invite_code: 'TEMP_CODE',
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_invite_code_active: true,
      };
    }

    return {
      ...org,
      organization_members: [],
    } as Organization;
  },

  // Обновление кода приглашения
  async regenerateInviteCode(organizationId: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не аутентифицирован');

    const { data, error } = await supabase.rpc('regenerate_invite_code', {
      org_id: organizationId,
    });

    if (error) throw new Error(`Ошибка обновления кода: ${error.message}`);
    return data;
  },

  // Деактивация кода
  async deactivateInviteCode(organizationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не аутентифицирован');

    const { error } = await supabase
      .from('organizations')
      .update({
        is_invite_code_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', organizationId)
      .eq('created_by', user.id);

    if (error) throw new Error(`Не удалось деактивировать код: ${error.message}`);
  },

  // Удаление организации
  async deleteOrganization(organizationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не аутентифицирован');

    const { error } = await supabase.rpc('delete_organization', {
      org_id: organizationId,
    });

    if (error) throw new Error(`Ошибка удаления организации: ${error.message}`);
  },
};