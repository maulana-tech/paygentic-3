"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/user";
import { ActivityLog, LogType, getActivityLogsByUser } from "@/data/store";

const LOG_ICONS: Record<LogType, { icon: React.ReactNode; bg: string; text: string }> = {
  PURCHASE: {
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    bg: "bg-green-100",
    text: "text-green-700",
  },
  SALE: {
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.337 2.88.9M12 20c-1.657 0-3-.895-3-2s1.343-2 3-2 3 .895 3 2-1.343 2-3 2m-2-4h.01M6 16H4v2h2v-2z" />
      </svg>
    ),
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
  LISTING_CREATED: {
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    bg: "bg-slate-100",
    text: "text-slate-700",
  },
  LISTING_UPDATED: {
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    bg: "bg-slate-100",
    text: "text-slate-700",
  },
  ERROR: {
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    bg: "bg-red-100",
    text: "text-red-700",
  },
  INFO: {
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bg: "bg-brand-light",
    text: "text-brand",
  },
  OFFER_MADE: {
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    bg: "bg-purple-100",
    text: "text-purple-700",
  },
  OFFER_ACCEPTED: {
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    bg: "bg-green-100",
    text: "text-green-700",
  },
  OFFER_DECLINED: {
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    bg: "bg-red-100",
    text: "text-red-700",
  },
  COUNTER_OFFER: {
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    bg: "bg-orange-100",
    text: "text-orange-700",
  },
  REVIEW_SUBMITTED: {
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    bg: "bg-yellow-100",
    text: "text-yellow-700",
  },
  SUBSCRIPTION_CREATED: {
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
};

const FILTER_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "PURCHASE", label: "Purchases" },
  { value: "SALE", label: "Sales" },
  { value: "LISTING_CREATED", label: "Listings" },
  { value: "OFFER_MADE", label: "Offers" },
  { value: "REVIEW_SUBMITTED", label: "Reviews" },
  { value: "SUBSCRIPTION_CREATED", label: "Subscriptions" },
  { value: "ERROR", label: "Errors" },
] as const;

interface Props {
  maxItems?: number;
  showFilters?: boolean;
}

export function ActivityLogPanel({ maxItems = 50, showFilters = true }: Props) {
  const { user, isConnected } = useUserStore();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filter, setFilter] = useState<LogType | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isConnected) {
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLogs(getActivityLogsByUser(user.id));
    setLoading(false);
  }, [user, isConnected]);

  const filteredLogs = filter === "ALL" ? logs : logs.filter((log) => log.type === filter);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (!isConnected) {
    return (
      <div className="glass-panel rounded-[1.75rem] p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm text-text-secondary">Connect your wallet to see activity</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass-panel rounded-[1.75rem] p-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-brand" />
          <div className="h-2 w-2 animate-pulse rounded-full bg-brand [animation-delay:150ms]" />
          <div className="h-2 w-2 animate-pulse rounded-full bg-brand [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  return (
    <section className="glass-panel overflow-hidden rounded-[1.75rem]">
      <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4">
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-text-main">Activity</h3>
            <p className="text-xs text-text-secondary">Recent agent actions, purchases, and system events</p>
          </div>
        </div>
        <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-text-muted">
          {filteredLogs.length} {filteredLogs.length === 1 ? "item" : "items"}
        </span>
      </div>

      {showFilters && (
        <div className="flex gap-2 overflow-x-auto border-b border-slate-200/80 bg-white/35 px-4 py-3">
          {FILTER_OPTIONS.map((option) => {
            const count = option.value === "ALL" ? logs.length : logs.filter((log) => log.type === option.value).length;

            return (
              <button
                key={option.value}
                onClick={() => setFilter(option.value as LogType | "ALL")}
                type="button"
                className={`focus-ring flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-2 text-xs font-medium transition-all ${
                  filter === option.value
                    ? "border-brand bg-brand text-white shadow-sm"
                    : "border-slate-200 bg-white/70 text-text-muted hover:border-slate-300 hover:bg-white"
                }`}
              >
                <span>{option.label}</span>
                {count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      filter === option.value ? "bg-white/20 text-white" : "bg-slate-100 text-text-muted"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="max-h-[30rem] overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-text-secondary">
              {filter === "ALL" ? "No activity yet" : `No ${filter.toLowerCase().replace("_", " ")} yet`}
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              {filter === "ALL" ? "Your actions will appear here" : "Try a different filter"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/80">
            {filteredLogs.slice(0, maxItems).map((log) => {
              const iconData = LOG_ICONS[log.type] || LOG_ICONS.INFO;
              const isExpanded = expandedId === log.id;

              return (
                <button
                  key={log.id}
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() => toggleExpand(log.id)}
                  className={`focus-ring group block w-full text-left transition-colors hover:bg-white/45 ${
                    isExpanded ? "bg-white/45" : ""
                  }`}
                >
                  <div className="flex items-start gap-3 px-4 py-3">
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${iconData.bg} ${iconData.text}`}>
                      {iconData.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-medium text-text-main">
                          {log.type.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}
                        </span>
                        <span className="shrink-0 text-xs text-text-secondary">{formatTime(log.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-sm leading-5 text-text-secondary">{log.message}</p>

                      {isExpanded && log.details && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {Object.entries(log.details).map(([key, value]) => (
                            <span
                              key={key}
                              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1.5 text-xs font-medium text-text-secondary"
                            >
                              <span className="capitalize text-text-secondary">{key}:</span>
                              <span className="text-text-main">{value}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {log.details && (
                      <div className={`shrink-0 pt-1 text-text-secondary transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
