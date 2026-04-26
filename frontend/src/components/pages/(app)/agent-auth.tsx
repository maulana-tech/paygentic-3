"use client";

import { useState, useEffect } from "react";
import { useAgentStore } from "@/store/agent";
import { Agent } from "@/data/store";

interface Props {
  onAgentSelect?: (agent: Agent) => void;
}

export function AgentAuth({ onAgentSelect }: Props) {
  const { currentAgent, setCurrentAgent, isAuthenticated, logout } = useAgentStore();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetch("/api/agents")
      .then((res) => res.json())
      .then((data) => setAgents(data.agents || []))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (agent: Agent) => {
    setCurrentAgent(agent);
    setShowDropdown(false);
    onAgentSelect?.(agent);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
      </div>
    );
  }

  if (isAuthenticated && currentAgent) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
            {currentAgent.name.charAt(0)}
          </div>
          <div className="hidden text-sm md:block">
            <p className="font-medium text-text-main">{currentAgent.name}</p>
            <p className="text-xs text-text-secondary">
              {currentAgent.walletAddress.slice(0, 6)}...{currentAgent.walletAddress.slice(-4)}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="rounded-md px-3 py-1.5 text-sm text-text-secondary hover:bg-gray-100"
        >
          Switch
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 rounded-lg border border-border-main bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-brand"
      >
        <span>Connect Agent</span>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-border-main bg-surface shadow-lg">
          <div className="p-2">
            <p className="px-3 py-2 text-xs font-semibold text-text-secondary">Select Agent</p>
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => handleSelect(agent)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-light text-sm font-semibold text-brand">
                  {agent.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-main">{agent.name}</p>
                  <p className="text-xs text-text-secondary">
                    {agent.walletAddress.slice(0, 8)}...{agent.walletAddress.slice(-4)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}