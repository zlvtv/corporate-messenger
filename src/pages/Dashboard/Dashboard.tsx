// src/pages/Dashboard/Dashboard.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { OrganizationProvider, useOrganization } from '../../context/OrganizationContext';
import { ProjectProvider, useProject } from '../../contexts/ProjectContext';
import Button from '../../components/ui/Button/Button';
import Modal from '../../components/ui/Modal/Modal';
import Input from '../../components/ui/Input/Input';
import OrganizationSidebar from '../../components/organization/OrganizationSidebar/OrganizationSidebar';
import OrganizationContent from '../../components/organization/OrganizationContent/OrganizationContent';
import styles from './Dashboard.module.css';

const presetColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#06B6D4',
];

const DashboardContent: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { organizations, currentOrganization, createOrganization, joinOrganization, setCurrentOrganization, refreshOrganizations } = useOrganization();
  const { createProject: createProjectInContext, loadProjects } = useProject();

  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectColor, setProjectColor] = useState('#3B82F6');
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const hasOrganizations = organizations.length > 0;

  const welcomeData = {
    title: currentOrganization
      ? "С возвращением в TeamBridge!"
      : "Добро пожаловать в TeamBridge!",
    description: currentOrganization
      ? "Выберите организацию из списка слева или создайте новую для продолжения работы."
      : "Создайте свою первую организацию или присоединитесь к существующей для начала работы.",
    showActionButtons: !currentOrganization && !hasOrganizations,
  };

  const resetError = () => setError(null);

  // Создание проекта
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !currentOrganization) {
      setError('Название проекта обязательно');
      return;
    }

    setIsLoading(true);
    try {
      await createProjectInContext({
        name: projectName.trim(),
        description: projectDescription.trim() || undefined,
        color: projectColor,
        organization_id: currentOrganization.id,
      });

      setProjectName('');
      setProjectDescription('');
      setProjectColor('#3B82F6');
      setIsCreateProjectModalOpen(false);

      if (currentOrganization) await loadProjects(currentOrganization.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания проекта');
    } finally {
      setIsLoading(false);
    }
  };

  // Создание организации
  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      setError('Название организации обязательно');
      return;
    }

    setIsLoading(true);
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

  // Вступление в организацию
  const handleJoinOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = inviteCode.trim().toUpperCase();
    if (!code) {
      setError('Введите код приглашения');
      return;
    }

    setIsLoading(true);
    try {
      const joinedId = await joinOrganization(code);
      setInviteCode('');
      setIsJoinModalOpen(false);
      await refreshOrganizations();

      const joinedOrg = organizations.find(org => org.id === joinedId);
      if (joinedOrg) setCurrentOrganization(joinedOrg);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка вступления в организацию');
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
          onOpenCreateModal={() => {
            resetError();
            setIsCreateModalOpen(true);
          }}
          onOpenJoinModal={() => {
            resetError();
            setInviteCode('');
            setIsJoinModalOpen(true);
          }}
        />

        <div className={styles.dashboard__content}>
          {currentOrganization ? (
            <OrganizationContent
              onOpenCreateProjectModal={() => {
                if (!currentOrganization) {
                  setError('Сначала выберите организацию');
                  return;
                }
                resetError();
                setIsCreateProjectModalOpen(true);
              }}
            />
          ) : (
            <div className={styles.dashboard__welcome}>
              <h2>{welcomeData.title}</h2>
              <p>{welcomeData.description}</p>

              {welcomeData.showActionButtons && (
                <div className={styles.dashboard__actionButtons}>
                  <Button variant="primary" onClick={() => {
                    resetError();
                    setIsCreateModalOpen(true);
                  }}>
                    Создать организацию
                  </Button>
                  <Button variant="secondary" onClick={() => {
                    resetError();
                    setInviteCode('');
                    setIsJoinModalOpen(true);
                  }}>
                    Присоединиться
                  </Button>
                </div>
              )}

              {!currentOrganization && hasOrganizations && (
                <div className={styles.dashboard__hint}>
                  <p><strong>Совет:</strong> Выберите организацию из списка слева.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Модалка: создание проекта */}
      <Modal
        isOpen={isCreateProjectModalOpen}
        onClose={() => {
          resetError();
          setProjectName('');
          setProjectDescription('');
          setProjectColor('#3B82F6');
          setIsCreateProjectModalOpen(false);
        }}
        title="Создать проект"
        size="medium"
      >
        <form onSubmit={handleCreateProject} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Название проекта *</label>
            <Input
              type="text"
              placeholder="Название проекта"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Описание</label>
            <textarea
              placeholder="Описание проекта"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className={styles.textarea}
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Цвет проекта</label>
            <div className={styles.colorPicker}>
              {presetColors.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`${styles.colorOption} ${projectColor === color ? styles.colorOptionSelected : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setProjectColor(color)}
                />
              ))}
            </div>
          </div>

          {error && <div className={styles.formError}>{error}</div>}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={() => setIsCreateProjectModalOpen(false)} disabled={isLoading}>
              Отмена
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading || !projectName.trim()}>
              {isLoading ? 'Создание...' : 'Создать'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Модалка: создание организации */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          resetError();
          setOrgName('');
          setOrgDescription('');
          setIsCreateModalOpen(false);
        }}
        title="Создать организацию"
        size="medium"
      >
        <form onSubmit={handleCreateOrganization} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Название *</label>
            <Input
              type="text"
              placeholder="Название организации"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Описание</label>
            <textarea
              placeholder="Описание"
              value={orgDescription}
              onChange={(e) => setOrgDescription(e.target.value)}
              className={styles.textarea}
              rows={3}
            />
          </div>

          {error && <div className={styles.formError}>{error}</div>}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)} disabled={isLoading}>
              Отмена
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading || !orgName.trim()}>
              {isLoading ? 'Создание...' : 'Создать'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Модалка: вступление */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => {
          resetError();
          setInviteCode('');
          setIsJoinModalOpen(false);
        }}
        title="Вступить в организацию"
        size="small"
      >
        <form onSubmit={handleJoinOrganization} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Код приглашения *</label>
            <Input
              type="text"
              placeholder="Код"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              required
            />
          </div>

          {error && <div className={styles.formError}>{error}</div>}

          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={() => setIsJoinModalOpen(false)} disabled={isLoading}>
              Отмена
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading || !inviteCode.trim()}>
              {isLoading ? 'Вступление...' : 'Вступить'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const Dashboard: React.FC = () => (
  <OrganizationProvider>
    <ProjectProvider>
      <DashboardContent />
    </ProjectProvider>
  </OrganizationProvider>
);

export default Dashboard;