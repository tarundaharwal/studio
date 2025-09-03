'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut, User, updateProfile } from 'firebase/auth';
import { app, isFirebaseConfigured } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  updateUserProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const firebaseReady = isFirebaseConfigured();
  
  const auth = firebaseReady && app ? getAuth(app) : null;

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
      setUser(null);
    }
  }, [auth]);

  const logout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  const updateUserProfile = async (displayName: string) => {
    if (auth && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName });
      // We need to create a new user object to trigger a re-render
      setUser(auth.currentUser ? { ...auth.currentUser } : null);
    } else {
      throw new Error("User not found or auth not initialized.");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
