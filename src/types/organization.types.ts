// src/types/organization.types.ts
export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}


export interface Organization {
  id: string;
  name: string;
  description?: string;
  invite_code?: string; // Теперь опционально - может быть скрыто
  created_by: string;
  created_at: string;
  updated_at: string;
  invite_code_generated_at?: string;
  invite_code_expires_at?: string;
  next_code_update?: string;
  is_invite_code_active?: boolean;
  is_owner?: boolean; // Новое поле - является ли пользователь владельцем
}

export interface OrganizationWithMembers extends Organization {
  organization_members: OrganizationMember[];
}