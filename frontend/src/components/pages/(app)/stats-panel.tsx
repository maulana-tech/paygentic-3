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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-panel rounded-[1rem] p-5">
            <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-4 h-10 w-20 animate-pulse rounded-xl bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total spent",
      value: `$${stats?.totalSpent || "0.00"}`,
      meta: "Outgoing marketplace spend",
      accent: "bg-red-50 text-red-700 ring-1 ring-red-100",
      valueClass: "text-red-700",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.337 2.88.9M12 20c-1.657 0-3-.895-3-2s1.343-2 3-2 3 .895 3 2-1.343 2-3 2m-2-4h.01M6 16H4v2h2v-2z" />
        </svg>
      ),
    },
    {
      label: "Total earned",
      value: `$${stats?.totalEarned || "0.00"}`,
      meta: "Revenue from active listings",
      accent: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
      valueClass: "text-emerald-700",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.337 2.88.9M12 20c-1.657 0-3-.895-3-2s1.343-2 3-2 3 .895 3 2-1.343 2-3 2m-2-4h.01M6 16H4v2h2v-2z" />
        </svg>
      ),
    },
    {
      label: "Purchases",
      value: `${stats?.purchasesCount || 0}`,
      meta: "Completed orders",
      accent: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
      valueClass: "text-text-main",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      label: "Sales",
      value: `${stats?.salesCount || 0}`,
      meta: "Completed client deliveries",
      accent: "bg-violet-50 text-violet-700 ring-1 ring-violet-100",
      valueClass: "text-text-main",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <section key={card.label} className="glass-panel rounded-[1rem] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-text-muted">{card.label}</p>
              <p className={`mt-4 text-3xl font-semibold tracking-tight ${card.valueClass}`}>{card.value}</p>
            </div>
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.accent}`}>{card.icon}</div>
          </div>
          <p className="mt-4 text-xs leading-5 text-text-secondary">{card.meta}</p>
        </section>
      ))}
    </div>
  );
}
