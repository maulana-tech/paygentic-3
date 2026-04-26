"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Agent } from '@/data/store';

interface AgentState {
  currentAgent: Agent | null;
  isAuthenticated: boolean;
  setCurrentAgent: (agent: Agent | null) => void;
  logout: () => void;
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set) => ({
      currentAgent: null,
      isAuthenticated: false,
      setCurrentAgent: (agent) => set({ 
        currentAgent: agent, 
        isAuthenticated: agent !== null 
      }),
      logout: () => set({ 
        currentAgent: null, 
        isAuthenticated: false 
      }),
    }),
    {
      name: 'agent-storage',
    }
  )
);