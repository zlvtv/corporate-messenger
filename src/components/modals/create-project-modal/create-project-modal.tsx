// src/components/modals/create-project-modal/create-project-modal.tsx
import React, { useState } from 'react';
import { useProject } from '../../../contexts/ProjectContext';
import { useOrganization } from '../../../contexts/OrganizationContext';
import Modal from '../../ui/modal/modal';
import Button from '../../ui/button/button';
import styles from './create-project-modal.module.css';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
  const { createProject } = useProject();
  const { currentOrganization } = useOrganization();
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!currentOrganization) {
      setError('Нет активной организации');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      await createProject({
        name: name.trim(),
        organization_id: currentOrganization.id,
      });
      setName('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать проект');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Новый проект">
      <form onSubmit={handleSubmit}>
        {error && <p className={styles.error}>{error}</p>}
        <input
          type="text"
          className={styles.input}
          placeholder="Название проекта"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isCreating}
          autoFocus
        />
        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isCreating}>
            Отмена
          </Button>
          <Button type="submit" variant="primary" disabled={isCreating || !name.trim()}>
            {isCreating ? 'Создание...' : 'Создать'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;
