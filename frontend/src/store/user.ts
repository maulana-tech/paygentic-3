"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Preferences, defaultPreferences } from '@/data/store';

interface UserState {
  user: User | null;
  preferences: Preferences;
  isConnected: boolean;
  setUser: (user: User | null) => void;
  setPreferences: (prefs: Preferences) => void;
  updatePreferences: (prefs: Partial<Preferences>) => void;
  disconnect: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      preferences: defaultPreferences,
      isConnected: false,
      setUser: (user) => set({ 
        user, 
        isConnected: user !== null 
      }),
      setPreferences: (preferences) => set({ preferences }),
      updatePreferences: (newPrefs) => set((state) => ({ 
        preferences: { ...state.preferences, ...newPrefs }
      })),
      disconnect: () => set({ 
        user: null, 
        isConnected: false,
        preferences: defaultPreferences
      }),
    }),
    {
      name: 'user-storage',
    }
  )
);