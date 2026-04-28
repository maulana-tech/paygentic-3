"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/user";
import { AgentStats, getUserStats } from "@/data/store";

export function StatsPanel() {
  const { user, isConnected } = useUserStore();
  const [stats, setStats] = useState<AgentStats | null>(null);

  useEffect(() => {
    if (!user || !isConnected) {
      setStats(null);
      return;
    }

    setStats(getUserStats(user.id));
  }, [user, isConnected]);

  if (!isConnected) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border-main bg-surface p-5">
            <div className="h-4 w-20 animate-pulse rounded-lg bg-gray-200" />
            <div className="mt-3 h-10 w-16 animate-pulse rounded-lg bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div className="rounded-xl border border-border-main bg-surface p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.337 2.88.9M12 20c-1.657 0-3-.895-3-2s1.343-2 3-2 3 .895 3 2-1.343 2-3 2m-2-4h.01M6 16H4v2h2v-2z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-text-secondary">Total Spent</span>
        </div>
        <p className="mt-3 text-2xl font-bold text-red-600">
          ${stats?.totalSpent || '0.00'}
        </p>
        <p className="mt-1 text-xs text-text-secondary">USDC</p>
      </div>
      <div className="rounded-xl border border-border-main bg-surface p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.337 2.88.9M12 20c-1.657 0-3-.895-3-2s1.343-2 3-2 3 .895 3 2-1.343 2-3 2m-2-4h.01M6 16H4v2h2v-2z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-text-secondary">Total Earned</span>
        </div>
        <p className="mt-3 text-2xl font-bold text-green-600">
          ${stats?.totalEarned || '0.00'}
        </p>
        <p className="mt-1 text-xs text-text-secondary">USDC</p>
      </div>
      <div className="rounded-xl border border-border-main bg-surface p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-text-secondary">Purchases</span>
        </div>
        <p className="mt-3 text-2xl font-bold text-text-main">
          {stats?.purchasesCount || 0}
        </p>
        <p className="mt-1 text-xs text-text-secondary">completed</p>
      </div>
      <div className="rounded-xl border border-border-main bg-surface p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
            <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-text-secondary">Sales</span>
        </div>
        <p className="mt-3 text-2xl font-bold text-text-main">
          {stats?.salesCount || 0}
        </p>
        <p className="mt-1 text-xs text-text-secondary">completed</p>
      </div>
    </div>
  );
}