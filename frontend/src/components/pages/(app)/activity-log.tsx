"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/user";
import { ActivityLog, LogType, getActivityLogsByUser } from "@/data/store";

const LOG_ICONS: Record<LogType, { icon: string; color: string }> = {
  PURCHASE: { icon: "💳", color: "text-green-600" },
  SALE: { icon: "💰", color: "text-blue-600" },
  LISTING_CREATED: { icon: "➕", color: "text-gray-600" },
  LISTING_UPDATED: { icon: "✏️", color: "text-gray-600" },
  ERROR: { icon: "⚠️", color: "text-red-600" },
  INFO: { icon: "ℹ️", color: "text-blue-600" },
};

const LOG_COLORS: Record<LogType, string> = {
  PURCHASE: "border-l-green-500 bg-green-50",
  SALE: "border-l-blue-500 bg-blue-50",
  LISTING_CREATED: "border-l-gray-400 bg-gray-50",
  LISTING_UPDATED: "border-l-gray-400 bg-gray-50",
  ERROR: "border-l-red-500 bg-red-50",
  INFO: "border-l-brand bg-brand-light",
};

interface Props {
  maxItems?: number;
  showFilters?: boolean;
}

export function ActivityLogPanel({ maxItems = 50, showFilters = true }: Props) {
  const { user, isConnected } = useUserStore();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filter, setFilter] = useState<LogType | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isConnected) {
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const userLogs = getActivityLogsByUser(user.id);
    setLogs(userLogs);
    setLoading(false);
  }, [user, isConnected]);

  const filteredLogs = filter === 'ALL' ? logs : logs.filter(l => l.type === filter);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isConnected) {
    return (
      <div className="rounded-none border border-border-main bg-surface p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-none bg-gray-100">
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
      <div className="rounded-none border border-border-main bg-surface p-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-none bg-brand" />
          <div className="h-2 w-2 animate-pulse rounded-none bg-brand [animation-delay:150ms]" />
          <div className="h-2 w-2 animate-pulse rounded-none bg-brand [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-none border border-border-main bg-surface">
      <div className="flex items-center justify-between border-b border-border-main px-4 py-3">
        <h3 className="font-semibold text-text-main">Activity Log</h3>
        <span className="text-xs text-text-secondary">{filteredLogs.length} entries</span>
      </div>

      {showFilters && (
        <div className="flex gap-1 border-b border-border-main bg-gray-50 px-4 py-2">
          {(['ALL', 'PURCHASE', 'SALE', 'LISTING_CREATED', 'ERROR'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                filter === type
                  ? "bg-brand text-white"
                  : "text-text-secondary hover:bg-gray-200"
              }`}
            >
              {type === 'ALL' ? 'All' : type.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}

      <div className="max-h-96 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-text-secondary">No activity yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border-main">
            {filteredLogs.slice(0, maxItems).map((log) => (
              <div
                key={log.id}
                className={`border-l-4 px-4 py-3 ${LOG_COLORS[log.type]}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-main">
                      {LOG_ICONS[log.type].icon} {log.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {formatTime(log.createdAt)}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-text-secondary">{log.message}</p>
                {log.details && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(log.details).map(([key, value]) => (
                      <span
                        key={key}
                        className="rounded bg-white px-2 py-0.5 text-xs text-text-secondary"
                      >
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}