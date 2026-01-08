import React, { useState, useEffect } from 'react';
import { useOrganization } from '../../../contexts/OrganizationContext';
import Button from '../../ui/button/button';
import styles from './invite-modal.module.css';

interface InviteModalProps {
  organizationId: string;
  onClose: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ organizationId, onClose }) => {
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { createOrganizationInvite } = useOrganization();

  useEffect(() => {
    const fetchLink = async () => {
      try {
        const result = await createOrganizationInvite(organizationId);
        setLink(result.invite_link);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchLink();
  }, [organizationId, createOrganizationInvite]);

  const copyLink = () => {
    if (link) {
      navigator.clipboard.writeText(link);
      alert('Ссылка скопирована!');
    }
  };

  return (
    <div className={styles.modal}>
      <h3>Пригласить в организацию</h3>
      {loading && <p>Создание ссылки...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {link && (
        <div className={styles.link}>
          <input readOnly value={link} onClick={(e) => e.currentTarget.select()} />
          <Button onClick={copyLink}>Копировать</Button>
        </div>
      )}
      <p>Ссылка действует 24 часа и может быть использована один раз.</p>
      <Button onClick={onClose}>Закрыть</Button>
    </div>
  );
};

export default InviteModal;
