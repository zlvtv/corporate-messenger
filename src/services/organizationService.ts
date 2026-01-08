import { supabase } from '../lib/supabase';
import {
  Organization,
  OrganizationWithMembers,
  CreateOrganizationData,
  OrganizationInvite,
} from '../types/organization.types';

export const organizationService = {
  async getUserOrganizations(): Promise<OrganizationWithMembers[]> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Не удалось получить данные пользователя');
    }

    const { data, error } = await supabase.rpc('get_user_organizations_with_members');
    if (error) throw new Error(`Ошибка загрузки организаций: ${error.message}`);

    return (data as OrganizationWithMembers[]) || [];
  },

  async joinOrganization(inviteCode: string): Promise<string> {
    console.warn('joinOrganization устарел — используйте accept_organization_invite');
    return '';
  },

  async createOrganization(data: CreateOrganizationData): Promise<Organization> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не аутентифицирован');

    const { data: orgId, error: rpcError } = await supabase.rpc('create_organization_with_owner', {
      org_name: data.name,
      org_description: data.description || null,
    });

    if (rpcError || !orgId) throw new Error(rpcError?.message || 'Ошибка создания');

    const { data: org, error: fetchError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();

    if (fetchError) {
      return {
        id: orgId,
        name: data.name,
        description: data.description,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    return { ...org, organization_members: [] } as Organization;
  },

  async createOrganizationInvite(organizationId: string): Promise<OrganizationInvite> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Не аутентифицирован');

    const { data, error } = await supabase.rpc('create_organization_invite', {
      org_id: organizationId,
    });

    if (error) throw new Error(`Ошибка создания приглашения: ${error.message}`);
    return data;
  },

  async deleteOrganization(organizationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Не аутентифицирован');

    const { error } = await supabase.rpc('delete_organization', {
      org_id: organizationId,
    });

    if (error) throw new Error(`Ошибка удаления: ${error.message}`);
  },
};
