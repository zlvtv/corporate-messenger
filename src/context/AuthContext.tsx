// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile, AuthContextType } from '../types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
  let isMounted = true;

  const handleAuthStateChange = (event: any, session: any) => {
    if (!isMounted) return;

    const userData = session?.user
      ? {
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user',
          full_name: session.user.user_metadata?.full_name || 'User',
        }
      : null;

    setUser(userData);
    setIsLoading(false);
  };

  const initialize = async () => {
    try {
      // Явно ждём сессию
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('❌ Ошибка при старте сессии:', error);
      }

      handleAuthStateChange(null, session);
    } catch (err) {
      console.error('💥 Критическая ошибка инициализации:', err);
      if (isMounted) {
        setUser(null);
        setIsLoading(false);
      }
    } finally {
      if (isMounted) {
        setIsInitialized(true); // ✅ ГАРАНТИРОВАННО ставим true
      }
    }
  };

  initialize();

  // Подписка на будущие изменения
  const subscription = supabase.auth.onAuthStateChange(handleAuthStateChange);

  return () => {
    isMounted = false;
    if (subscription && typeof subscription.unsubscribe === 'function') {
      subscription.unsubscribe();
    }
  };
}, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      if (password.length < 6) {
        throw new Error('Пароль должен быть не меньше 6 символов.');
      }
      if (!username.trim()) {
        throw new Error('Username is required.');
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: username.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('already') || msg.includes('exists')) {
          throw new Error('Этот email уже зарегистрирован.');
        }
        throw new Error(`Регистрация не удалась: ${error.message}`);
      }

      if (!data.user) {
        throw new Error('Регистрация не удалась: нет данных пользователя.');
      }

      const needsEmailConfirmation = !data.session;

      return {
        user: data.user,
        session: data.session,
        needsEmailConfirmation,
      };
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      console.error('Ошибка входа:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Ошибка выхода:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    isInitialized,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};