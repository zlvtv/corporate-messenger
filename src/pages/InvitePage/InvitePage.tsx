import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrganization } from '../../contexts/OrganizationContext';
import { useAuth } from '../../contexts/AuthContext';

const InvitePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { user, isInitialized } = useAuth();
  const { organizations, joinOrganization, refreshOrganizations, setCurrentOrganization } = useOrganization();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitialized || !token) return;

    const processInvite = async () => {
      if (!user) {
        try {
          localStorage.setItem('invite_token', token);
        } catch (e) {
          console.error('Не удалось сохранить invite_token');
        }
        navigate('/login', { replace: true });
        return;
      }

      const orgs = await refreshOrganizations();
      if (orgs.length > 0) {
        const org = orgs[0];
        setCurrentOrganization(org);
        navigate('/dashboard', { replace: true });
        return;
      }

      try {
        const orgId = await joinOrganization(token);
        const updatedOrgs = await refreshOrganizations();
        const org = updatedOrgs.find(o => o.id === orgId) || updatedOrgs[0] || null;

        if (org) {
          setCurrentOrganization(org);
        }

        navigate('/dashboard', { replace: true });
      } catch (err: any) {
        const msg = err.message || String(err);
        if (msg.includes('duplicate') || msg.includes('уже состоит')) {
          const orgs = await refreshOrganizations();
          const org = orgs[0] || null;
          if (org) setCurrentOrganization(org);
          navigate('/dashboard', { replace: true });
        } else if (msg.includes('invalid') || msg.includes('not found')) {
          alert('Приглашение недействительно');
          navigate('/', { replace: true });
        } else {
          alert('Ошибка вступления: ' + (msg.length < 100 ? msg : 'Сервер недоступен'));
          navigate('/dashboard', { replace: true });
        }
      }
    };

    processInvite();
  }, [token, user, isInitialized, refreshOrganizations, joinOrganization, setCurrentOrganization, navigate]);

  return token ? (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h2>Обработка приглашения...</h2>
      <p>Выполняется проверка и вступление в организацию</p>
    </div>
  ) : null;
};

export default InvitePage;