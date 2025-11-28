// src/pages/Dashboard/Dashboard.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { OrganizationProvider, useOrganization } from '../../context/OrganizationContext';
import Button from '../../components/ui/Button/Button';
import Modal from '../../components/ui/Modal/Modal';
import Input from '../../components/ui/Input/Input';
import OrganizationSidebar from '../../components/organization/OrganizationSidebar/OrganizationSidebar';
import OrganizationContent from '../../components/organization/OrganizationContent/OrganizationContent';
import styles from './Dashboard.module.css';

const DashboardContent: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { organizations, currentOrganization, createOrganization, joinOrganization, setCurrentOrganization, refreshOrganizations } = useOrganization();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasOrganizations = organizations && organizations.length > 0;

  const getWelcomeMessage = () => {
    if (hasOrganizations) {
      return {
        title: "С возвращением в TeamBridge!",
        description: "Выберите организацию из списка слева или создайте новую для продолжения работы.",
        showActionButtons: false
      };
    } else {
      return {
        title: "Добро пожаловать в TeamBridge!",
        description: "Создайте свою первую организацию или присоединитесь к существующей для начала работы.",
        showActionButtons: true
      };
    }
  };

  const welcomeData = getWelcomeMessage();

  const handleOpenCreateModal = () => {
    setError(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenJoinModal = () => {
    setError(null);
    setInviteCode('');
    setIsJoinModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setError(null);
    setOrgName('');
    setOrgDescription('');
    setIsCreateModalOpen(false);
  };

  const handleCloseJoinModal = () => {
    setError(null);
    setInviteCode('');
    setIsJoinModalOpen(false);
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await createOrganization({
        name: orgName.trim(),
        description: orgDescription.trim() || undefined,
      });
      setOrgName('');
      setOrgDescription('');
      setIsCreateModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания организации');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanInviteCode = inviteCode.trim().toUpperCase();
    
    if (!cleanInviteCode) {
      setError('Введите код приглашения');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const joinedOrganizationId = await joinOrganization(cleanInviteCode);
      setInviteCode('');
      setIsJoinModalOpen(false);
      
      await refreshOrganizations();
      
      const joinedOrg = organizations.find(org => org.id === joinedOrganizationId);
      if (joinedOrg) {
        setCurrentOrganization(joinedOrg);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка вступления в организацию';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.dashboard__header}>
        <div className={styles.dashboard__headerContent}>
          <h1 className={styles.dashboard__title}>TeamBridge</h1>
          <div className={styles.dashboard__userInfo}>
            <span className={styles.dashboard__userName}>
              {user?.username || user?.email}
            </span>
            <Button variant="secondary" onClick={handleSignOut}>
              Выйти
            </Button>
          </div>
        </div>
      </header>
      
      <main className={styles.dashboard__main}>
        <OrganizationSidebar 
          onOpenCreateModal={handleOpenCreateModal}
          onOpenJoinModal={handleOpenJoinModal}
        />
        
        <div className={styles.dashboard__content}>
          {currentOrganization ? (
            <OrganizationContent />
          ) : (
            <div className={styles.dashboard__welcome}>
              <h2>{welcomeData.title}</h2>
              <p>{welcomeData.description}</p>
              
              {welcomeData.showActionButtons && (
                <div className={styles.dashboard__actionButtons}>
                  <Button 
                    variant="primary" 
                    onClick={handleOpenCreateModal}
                  >
                    Создать организацию
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={handleOpenJoinModal}
                  >
                    Присоединиться к организации
                  </Button>
                </div>
              )}
              
              {hasOrganizations && (
                <div className={styles.dashboard__hint}>
                  <p><strong>Совет:</strong> Выберите организацию из списка слева, чтобы начать общение и управление задачами.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        title="Создать организацию"
        size="medium"
      >
        <form onSubmit={handleCreateOrganization} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="orgName" className={styles.formLabel}>
              Название организации *
            </label>
            <Input
              id="orgName"
              type="text"
              placeholder="Введите название организации"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="orgDescription" className={styles.formLabel}>
              Описание (необязательно)
            </label>
            <textarea
              id="orgDescription"
              placeholder="Введите описание организации"
              value={orgDescription}
              onChange={(e) => setOrgDescription(e.target.value)}
              className={styles.textarea}
              rows={3}
            />
          </div>

          {error && (
            <div className={styles.formError}>
              {error}
            </div>
          )}

          <div className={styles.modalActions}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseCreateModal}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !orgName.trim()}
            >
              {isLoading ? 'Создание...' : 'Создать организацию'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isJoinModalOpen}
        onClose={handleCloseJoinModal}
        title="Вступить в организацию"
        size="small"
      >
        <form onSubmit={handleJoinOrganization} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="inviteCode" className={styles.formLabel}>
              Код приглашения *
            </label>
            <Input
              id="inviteCode"
              type="text"
              placeholder="Введите код приглашения"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              required
            />
          </div>

          {error && (
            <div className={styles.formError}>
              {error}
            </div>
          )}

          <div className={styles.modalActions}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseJoinModal}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !inviteCode.trim()}
            >
              {isLoading ? 'Вступление...' : 'Вступить в организацию'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <OrganizationProvider>
      <DashboardContent />
    </OrganizationProvider>
  );
};

export default Dashboard;