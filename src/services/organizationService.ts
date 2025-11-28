// src/services/organizationService.ts
import { supabase } from '../lib/supabase';
import { Organization, OrganizationWithMembers, CreateOrganizationData, OrganizationMember } from '../types/organization.types';

export const organizationService = {
  async getUserOrganizations(): Promise<OrganizationWithMembers[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не аутентифицирован');

    try {
      const { data: organizations, error } = await supabase.rpc('get_user_organizations_with_members');

      if (error) {
        return [];
      }

      if (!organizations || organizations.length === 0) {
        return [];
      }
      
      return organizations as OrganizationWithMembers[];

    } catch (error) {
      return [];
    }
  },

  async joinOrganization(inviteCode: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не аутентифицирован');

    try {
      const cleanInviteCode = inviteCode.trim().toUpperCase();

      const { data: organizationId, error: joinError } = await supabase.rpc(
        'join_organization_by_invite',
        { p_invite_code: cleanInviteCode }
      );

      if (joinError) throw joinError;
      if (!organizationId) throw new Error('Не удалось вступить в организацию');

      return organizationId;

    } catch (error) {
      throw error;
    }
  },

  async createOrganization(data: CreateOrganizationData): Promise<Organization> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не аутентифицирован');

    try {
      const { data: organizationId, error: rpcError } = await supabase.rpc(
        'create_organization_with_owner',
        {
          org_name: data.name,
          org_description: data.description || null
        }
      );

      if (rpcError) throw rpcError;
      if (!organizationId) throw new Error('Ошибка создания организации');

      const { data: organization, error: fetchError } = await supabase
        .from('organizations')
        .select('id, name, description, invite_code, created_by, created_at, updated_at')
        .eq('id', organizationId)
        .single();

      if (fetchError) {
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
      throw error;
    }
  },

  async regenerateInviteCode(organizationId: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не аутентифицирован');

    const { data: newInviteCode, error } = await supabase.rpc(
      'regenerate_invite_code',
      { org_id: organizationId }
    );

    if (error) throw error;
    return newInviteCode;
  },

  async deactivateInviteCode(organizationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не аутентифицирован');

    const { error } = await supabase
      .from('organizations')
      .update({ 
        is_invite_code_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', organizationId)
      .eq('created_by', user.id);

    if (error) throw error;
  },

  async deleteOrganization(organizationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не аутентифицирован');

    const { error } = await supabase.rpc('delete_organization', {
      org_id: organizationId
    });

    if (error) {
      throw new Error(`Ошибка удаления организации: ${error.message}`);
    }
  }
};