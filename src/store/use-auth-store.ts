
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Session, UserCredentials } from '@/services/angelone';

type AuthStoreState = {
  credentials: UserCredentials | null;
  session: Session | null;
  setCredentials: (credentials: UserCredentials) => void;
  setSession: (session: Session | null) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      credentials: null,
      session: null,
      setCredentials: (credentials) => set({ credentials }),
      setSession: (session) => set({ session }),
      clearAuth: () => set({ credentials: null, session: null }),
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
