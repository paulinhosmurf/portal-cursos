import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (!error && data) {
      setUserProfile(data);
    } else {
      setUserProfile(null);
    }
  };

  useEffect(() => {
    // Initial session fetch
    const initAuth = async () => {
      // Timeout de 5s para não travar o site se o Supabase demorar
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na sessão')), 5000)
      );

      try {
        const sessionPromise = supabase.auth.getSession();
        const { data: { session } } = (await Promise.race([sessionPromise, timeoutPromise])) as any;
        
        if (session?.user) {
          setCurrentUser(session.user);
          // Buscamos o perfil, mas não deixamos ele travar o 'loading' global pra sempre
          fetchProfile(session.user.id).finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Erro ou Timeout na inicialização do auth:', err);
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Evento de Auth:', event);
      if (session?.user) {
        setCurrentUser(prevUser => {
          if (prevUser?.id === session.user.id) return prevUser;
          return session.user;
        });
        
        const userId = session.user.id;
        if (!userProfile || userProfile.id !== userId) {
          // fetchProfile aqui também não deve bloquear o setLoading(false)
          fetchProfile(userId);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchProfile(currentUser.id);
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    signOut,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
