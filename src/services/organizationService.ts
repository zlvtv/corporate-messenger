// src/services/organizationService.ts
import { supabase } from '../lib/supabase';
import { Organization, OrganizationWithMembers, CreateOrganizationData, OrganizationMember } from '../types/organization.types';

export const organizationService = {
   async getUserOrganizations(): Promise<OrganizationWithMembers[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    try {
      // Используем RPC функцию для получения всех данных
      const { data: organizations, error } = await supabase.rpc('get_user_organizations_with_members');

      if (error) {
        console.error('RPC error:', error);
        return [];
      }

      if (!organizations || organizations.length === 0) {
        return [];
      }

      console.log('Found organizations with members:', organizations.length);
      
      // Преобразуем JSON[] в наш тип
      return organizations as OrganizationWithMembers[];

    } catch (error) {
      console.error('Error in getUserOrganizations:', error);
      return [];
    }
  },

  async joinOrganization(inviteCode: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    try {
      const cleanInviteCode = inviteCode.trim().toUpperCase();
      console.log('Joining with invite code:', cleanInviteCode);

      const { data: organizationId, error: joinError } = await supabase.rpc(
        'join_organization_by_invite',
        { p_invite_code: cleanInviteCode }
      );

      if (joinError) throw joinError;
      if (!organizationId) throw new Error('Failed to join organization');

      console.log('Successfully joined organization ID:', organizationId);
      return organizationId;

    } catch (error) {
      console.error('Error in joinOrganization:', error);
      throw error;
    }
  },

  async createOrganization(data: CreateOrganizationData): Promise<Organization> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    try {
      // Используем RPC функцию для создания
      const { data: organizationId, error: rpcError } = await supabase.rpc(
        'create_organization_with_owner',
        {
          org_name: data.name,
          org_description: data.description || null
        }
      );

      if (rpcError) throw rpcError;
      if (!organizationId) throw new Error('Organization creation failed');

      // Получаем созданную организацию
      const { data: organization, error: fetchError } = await supabase
        .from('organizations')
        .select('id, name, description, invite_code, created_by, created_at, updated_at')
        .eq('id', organizationId)
        .single();

      if (fetchError) {
        console.error('Error fetching created organization:', fetchError);
        // Но организация создана! Возвращаем базовые данные
        return {
          id: organizationId,
          name: data.name,
          description: data.description,
          invite_code: 'GENERATED',
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          organization_members: []
        } as Organization;
      }

      return {
        ...organization,
        organization_members: []
      };

    } catch (error) {
      console.error('Error in createOrganization:', error);
      throw error;
    }
  },

  // Добавление участника в организацию
  async addMember(organizationId: string, userId: string, role: 'owner' | 'admin' | 'member' = 'member'): Promise<void> {
    const { error } = await supabase
      .from('organization_members')
      .insert([
        {
          organization_id: organizationId,
          user_id: userId,
          role: role,
        }
      ]);

    if (error) {
      if (error.code === '23505') { // unique violation
        throw new Error('User is already a member of this organization');
      }
      throw error;
    }
  },

  // Получение участников организации
  async getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        *,
        profiles (
          username,
          email,
          full_name
        )
      `)
      .eq('organization_id', organizationId)
      .order('joined_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Проверка, является ли пользователь участником организации
  async isUserMember(organizationId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();

    return !!data && !error;
  },

  async regenerateInviteCode(organizationId: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: newInviteCode, error } = await supabase.rpc(
      'regenerate_invite_code',
      { org_id: organizationId }
    );

    if (error) throw error;
    return newInviteCode;
  },

  async deactivateInviteCode(organizationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('organizations')
      .update({ 
        is_invite_code_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', organizationId)
      .eq('created_by', user.id); // Только владелец может деактивировать

    if (error) throw error;
  }
};