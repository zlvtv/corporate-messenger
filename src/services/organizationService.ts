import { Organization, OrganizationWithMembers, CreateOrganizationData, OrganizationInvite } from '../types/organization.types';
import { auth, db } from '../lib/firebase';
import {
  getCollection,
  getDocsByQuery,
  createDoc,
  deleteDocById,
  getDocById,
} from '../lib/firestore';
import {
  collection,
  doc,
  query,
  where, 
  getDocs,
  deleteDoc,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';

const getCurrentUserId = () => {
  return auth.currentUser?.uid;
};

const getCurrentUser = () => {
  const user = auth.currentUser;
  if (!user) return null;
  return {
    id: user.uid,
    email: user.email || '',
    full_name: user.displayName || user.email?.split('@')[0] || 'User',
    username: user.email?.split('@')[0] || 'user',
    avatar_url: user.photoURL || null,
  };
};

export const organizationService = {
  async getOrganizationsLite(): Promise<Organization[]> {
    const userId = getCurrentUserId();
    if (!userId) return [];

    const orgs = await getCollection('organizations');
    return orgs
      .filter((org: any) => org.members?.includes(userId))
      .map(({ id, name, description, created_by, createdAt, updatedAt }: any) => ({
        id,
        name,
        description,
        created_by,
        created_at: createdAt?.toDate ? createdAt.toDate().toISOString() : createdAt,
        updated_at: updatedAt?.toDate ? updatedAt.toDate().toISOString() : updatedAt,
      }));
  },

  async getUserOrganizations(): Promise<OrganizationWithMembers[]> {
  const userId = getCurrentUserId();
  if (!userId) return [];

  const orgs = await getDocsByQuery('organizations', where('members', 'array-contains', userId));
  const result: OrganizationWithMembers[] = [];

  for (const org of orgs) {
    const membersSnap = await getDocsByQuery('organization_members', where('organization_id', '==', org.id));
    const membersWithUsers = await Promise.all(
      membersSnap.map(async (member: any) => {
        const userSnap = await getDocById('users', member.user_id);
        return {
          ...member,
          joined_at: member.joined_at?.toDate ? member.joined_at.toDate().toISOString() : member.joined_at,
          user: userSnap,
        };
      })
    );

    result.push({
      ...org,
      created_at: org.createdAt?.toDate ? org.createdAt.toDate().toISOString() : org.createdAt,
      updated_at: org.updatedAt?.toDate ? org.updatedAt.toDate().toISOString() : org.updatedAt,
      organization_members: membersWithUsers,
    });
  }

  return result.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA; 
  });
},

  async createOrganization(data: CreateOrganizationData): Promise<OrganizationWithMembers> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Пользователь не авторизован');

    const orgData = {
      name: data.name,
      description: data.description || null,
      created_by: userId,
      members: [userId],
    };

    const newOrg = await createDoc('organizations', orgData);

    await createDoc('organization_members', {
      organization_id: newOrg.id,
      user_id: userId,
      role: 'owner',
      joined_at: serverTimestamp(),
    });

    return {
      ...newOrg,
      organization_members: [
        {
          id: 'temp',
          organization_id: newOrg.id,
          user_id: userId,
          role: 'owner',
          joined_at: new Date().toISOString(),
          user: getCurrentUser()!,
        },
      ],
    };
  },

  async joinOrganization(inviteToken: string): Promise<string> {
    throw new Error('Функция приглашения временно недоступна');
  },

  async createOrganizationInvite(organizationId: string): Promise<OrganizationInvite> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Не авторизован');

    const inviteData = {
      organization_id: organizationId,
      created_by: userId,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      active: true,
    };

    const invite = await createDoc('organization_invites', inviteData);

    return {
      token: invite.id,
      expires_at: invite.expires_at.toISOString(),
      invite_link: `${window.location.origin}/invite/${invite.id}`,
    };
  },

  async deleteOrganization(organizationId: string): Promise<void> {
    const batch = writeBatch(db);

    batch.delete(doc(db, 'organizations', organizationId));

    const membersSnap = await getDocs(
      query(collection(db, 'organization_members'), where('organization_id', '==', organizationId))
    );
    membersSnap.docs.forEach(memberDoc => {
      batch.delete(memberDoc.ref);
    });

    const invitesSnap = await getDocs(
      query(collection(db, 'organization_invites'), where('organization_id', '==', organizationId))
    );
    invitesSnap.docs.forEach(inviteDoc => {
      batch.delete(inviteDoc.ref);
    });

    const projectsSnap = await getDocs(
      query(collection(db, 'projects'), where('orgId', '==', organizationId))
    );
    for (const projectDoc of projectsSnap.docs) {
      const messagesSnap = await getDocs(collection(db, `projects/${projectDoc.id}/messages`));
      messagesSnap.docs.forEach(msgDoc => {
        batch.delete(msgDoc.ref);
      });
      batch.delete(projectDoc.ref);
    }

    const tasksSnap = await getDocs(
      query(collection(db, 'tasks'), where('organization_id', '==', organizationId))
    );
    tasksSnap.docs.forEach(taskDoc => {
      batch.delete(taskDoc.ref);
    });

    await batch.commit();
  },
  async leaveOrganization(organizationId: string): Promise<void> {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Не авторизован');

    const members = await getDocsByQuery('organization_members', where('organization_id', '==', organizationId));
    const member = members.find(m => m.user_id === userId);

    if (member) {
      await deleteDocById('organization_members', member.id);
    }
  },
};
