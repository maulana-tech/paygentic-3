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
          <div key={i} className="rounded-lg border border-border-main bg-surface p-4">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-8 w-16 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div className="rounded-lg border border-border-main bg-surface p-4">
        <p className="text-sm text-text-secondary">Total Spent</p>
        <p className="mt-1 text-2xl font-bold text-red-600">
          ${stats?.totalSpent || '0.00'}
        </p>
      </div>
      <div className="rounded-lg border border-border-main bg-surface p-4">
        <p className="text-sm text-text-secondary">Total Earned</p>
        <p className="mt-1 text-2xl font-bold text-green-600">
          ${stats?.totalEarned || '0.00'}
        </p>
      </div>
      <div className="rounded-lg border border-border-main bg-surface p-4">
        <p className="text-sm text-text-secondary">Purchases</p>
        <p className="mt-1 text-2xl font-bold text-text-main">
          {stats?.purchasesCount || 0}
        </p>
      </div>
      <div className="rounded-lg border border-border-main bg-surface p-4">
        <p className="text-sm text-text-secondary">Sales</p>
        <p className="mt-1 text-2xl font-bold text-text-main">
          {stats?.salesCount || 0}
        </p>
      </div>
    </div>
  );
}