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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Erro na inicialização do auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Evento de Auth:', event);
      if (session?.user) {
        // Usamos uma atualização funcional para evitar loops se o usuário for o mesmo
        setCurrentUser(prevUser => {
          if (prevUser?.id === session.user.id) return prevUser;
          return session.user;
        });
        
        // Só buscamos perfil se o usuário for novo ou se ainda não temos perfil
        const userId = session.user.id;
        if (!userProfile || userProfile.id !== userId) {
          await fetchProfile(userId);
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
      {!loading && children}
    </AuthContext.Provider>
  );
};
