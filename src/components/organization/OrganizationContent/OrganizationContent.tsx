// OrganizationContent.tsx
import React, { useState } from 'react';
import { useOrganization } from '../../../context/OrganizationContext';
import styles from './OrganizationContent.module.css';

const OrganizationContent: React.FC = () => {
  const { 
    currentOrganization, 
    regenerateInviteCode, 
    deactivateInviteCode 
  } = useOrganization();
  const [isManagingInvite, setIsManagingInvite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!currentOrganization) {
    return null;
  }

  const getInviteCodeStatus = () => {
    if (!currentOrganization.is_invite_code_active) {
      return { status: 'deactivated', label: 'Deactivated', color: '#ef4444' };
    }
    if (new Date(currentOrganization.invite_code_expires_at) < new Date()) {
      return { status: 'expired', label: 'Expired', color: '#f59e0b' };
    }
    return { status: 'active', label: 'Active', color: '#10b981' };
  };

  const codeStatus = getInviteCodeStatus();

  const handleRegenerateCode = async () => {
    setIsLoading(true);
    try {
      await regenerateInviteCode(currentOrganization.id);
      setIsManagingInvite(false);
    } catch (error) {
      console.error('Error regenerating code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateCode = async () => {
    setIsLoading(true);
    try {
      await deactivateInviteCode(currentOrganization.id);
      setIsManagingInvite(false);
    } catch (error) {
      console.error('Error deactivating code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatExpirationDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.content}>
      <div className={styles.content__header}>
        <div className={styles.content__headerInfo}>
          <h1 className={styles.content__title}>{currentOrganization.name}</h1>
          {currentOrganization.description && (
            <p className={styles.content__description}>
              {currentOrganization.description}
            </p>
          )}
          <div className={styles.content__meta}>
            <div className={styles.content__inviteSection}>
              <div className={styles.content__inviteCode}>
                <span className={styles.inviteCode__label}>Invite Code:</span>
                <strong className={styles.inviteCode__value}>
                  {currentOrganization.invite_code}
                </strong>
                <span 
                  className={styles.inviteCode__status}
                  style={{ backgroundColor: codeStatus.color }}
                >
                  {codeStatus.label}
                </span>
                <button 
                  className={styles.inviteCode__manageButton}
                  onClick={() => setIsManagingInvite(!isManagingInvite)}
                  disabled={isLoading}
                >
                  {isManagingInvite ? 'Cancel' : 'Manage'}
                </button>
              </div>
              
              {isManagingInvite && (
                <div className={styles.inviteManagement}>
                  <div className={styles.inviteManagement__info}>
                    <p>Generated: {formatExpirationDate(currentOrganization.invite_code_generated_at)}</p>
                    <p>Expires: {formatExpirationDate(currentOrganization.invite_code_expires_at)}</p>
                  </div>
                  <div className={styles.inviteManagement__actions}>
                    <button 
                      className={`${styles.button} ${styles.buttonSecondary}`}
                      onClick={handleRegenerateCode}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Generating...' : 'Generate New Code'}
                    </button>
                    <button 
                      className={`${styles.button} ${styles.buttonDanger}`}
                      onClick={handleDeactivateCode}
                      disabled={isLoading || !currentOrganization.is_invite_code_active}
                    >
                      Deactivate Code
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <span className={styles.content__memberCount}>
              {currentOrganization.organization_members?.length || 0} members
            </span>
          </div>
        </div>
      </div>

      <div className={styles.content__body}>
        <div className={styles.placeholder}>
          <h3>Organization Dashboard</h3>
          <p>This is where your channels, messages, and tasks will appear.</p>
          <p>Next week we'll start building the channels functionality.</p>
          
          <div className={styles.placeholder__features}>
            <div className={styles.feature}>
              <h4>📝 Channels & Topics</h4>
              <p>Organize discussions by channels and topics</p>
            </div>
            <div className={styles.feature}>
              <h4>💬 Real-time Messages</h4>
              <p>Instant messaging with reactions and threads</p>
            </div>
            <div className={styles.feature}>
              <h4>✅ Task Management</h4>
              <p>Create and assign tasks with deadlines</p>
            </div>
            <div className={styles.feature}>
              <h4>📅 Calendar Integration</h4>
              <p>View all deadlines in one place</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationContent;