// src/pages/AuthCallback/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Получаем сессию после OAuth
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          console.error('Auth error:', error);
          navigate('/login?error=auth_failed', { replace: true });
          return;
        }

        // Перенаправляем в приложение
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Callback error:', err);
        navigate('/login', { replace: true });
      }
    };

    handleAuth();
  }, [navigate]);

  return <div>Вход в процессе...</div>;
};

export default AuthCallback;
