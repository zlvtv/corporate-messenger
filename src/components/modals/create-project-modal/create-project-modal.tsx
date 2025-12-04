// src/components/modals/create-project-modal/create-project-modal.tsx
import React, { useRef, useState } from 'react';
import { useProject } from '../../../contexts/ProjectContext';
import { useOrganization } from '../../../contexts/OrganizationContext';
import styles from './create-project-modal.module.css';

interface CreateProjectModalProps {
  anchorEl: HTMLElement;
  onClose: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ anchorEl, onClose }) => {
  const { createProject } = useProject();
  const { currentOrganization } = useOrganization();
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Позиционирование — справа от кнопки `+`
  const rect = anchorEl.getBoundingClientRect();
  const top = rect.bottom + 8;
  const left = rect.left;

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

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
    <div
      className={styles['create-project-backdrop']}
      onClick={handleOutsideClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className={styles['create-project-modal']}
        style={{ top, left }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={styles['create-project-modal__title']}>Новый проект</h3>

        {error && <p className={styles['create-project-modal__error']}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className={styles['create-project-modal__input']}
            placeholder="Название проекта"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isCreating}
            autoFocus
          />

          <div className={styles['create-project-modal__actions']}>
            <button
              type="button"
              className={styles['create-project-modal__cancel']}
              onClick={onClose}
              disabled={isCreating}
            >
              Отмена
            </button>
            <button
              type="submit"
              className={styles['create-project-modal__submit']}
              disabled={isCreating || !name.trim()}
            >
              {isCreating ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>

        <button
          className={styles['create-project-modal__close']}
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default CreateProjectModal;
