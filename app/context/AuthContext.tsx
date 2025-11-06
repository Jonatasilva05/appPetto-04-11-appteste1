// app/context/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useProtectedRoute } from '@/app/hooks/useProtectedRoute';

export const API_BASE_URL = 'http://192.168.14.191:3000'; // Mantenha seu IP aqui
export const API_URL = `${API_BASE_URL}/api`;

const TOKEN_KEY = 'auth-token-petto';

// Interface para os dados do usuário que vamos armazenar
interface UserProfile {
  nome: string;
  email: string;
  foto_url: string | null;
  role: 'tutor' | 'veterinario' | 'admin';
}

interface AuthContextType {
  signIn: (token: string, role: 'tutor' | 'veterinario' | 'admin') => Promise<void>;
  signOut: () => void;
  session?: string | null;
  user: UserProfile | null;
  role: 'tutor' | 'veterinario' | 'admin' | null;
  isLoading: boolean;
  getAuthHeader: () => HeadersInit | undefined;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<'tutor' | 'veterinario' | 'admin' | null>(null); // Novo state para a role
  const [isLoading, setIsLoading] = useState(true);

  const getAuthHeader = useCallback(() => {
    return session ? { Authorization: `Bearer ${session}` } : undefined;
  }, [session]);

  const fetchAndSetUser = async (token: string) => {
    if (!token) {
        setUser(null);
        setRole(null);
        return;
    }
    try {
        // <-- ESTA LINHA ESTAVA FALTANDO
        const response = await fetch(`${API_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setRole(userData.role);
        } else {
            console.warn('API Warning: Falha ao buscar detalhes do perfil.');
        }
    } catch (e) {
        console.error('Network Error: Não foi possível conectar à API para buscar perfil.', e);
    }
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  };

   useEffect(() => {
    const loadSession = async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
          setSession(token);
          await fetchAndSetUser(token);
        }
      } catch (e) {
        console.error('Erro ao carregar sessão:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  useProtectedRoute(session, isLoading);

  const authValues: AuthContextType = {
    signIn: async (token: string, newRole: 'tutor' | 'veterinario' | 'admin') => { // signIn modificado
      setSession(token);
      setRole(newRole); // Armazena a role imediatamente
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync('user-role', newRole); // Salva a role também
      await fetchAndSetUser(token);
    },
    signOut: async () => {
        setUser(null);
        setSession(null);
        setRole(null);
        await SecureStore.deleteItemAsync('user-role');
    },
    session,
    user,
    role, // Disponibiliza a role no contexto
    isLoading,
    getAuthHeader,
    refreshUserData: async () => {
        if (session) {
            await fetchAndSetUser(session);
        }
    }
  };

  return (
    <AuthContext.Provider value={authValues}>{children}</AuthContext.Provider>
  );
}