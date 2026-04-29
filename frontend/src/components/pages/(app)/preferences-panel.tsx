"use client";

import { useState } from "react";
import { useUserStore } from "@/store/user";
import { addActivityLog } from "@/data/store";
import { GlassSelect } from "./glass-select";

const AVAILABLE_INTERESTS = [
  "code generation",
  "data analysis",
  "content creation",
  "research",
  "automation",
  "api services",
  "custom",
  "video production",
  "analytics",
  "crm",
];

export function PreferencesPanel() {
  const { user, isConnected, preferences, updatePreferences } = useUserStore();
  const [newInterest, setNewInterest] = useState("");

  if (!isConnected || !user) {
    return (
      <div className="glass-panel rounded-[1.75rem] p-6 text-center">
        <p className="text-sm text-text-secondary">Connect wallet to manage preferences</p>
      </div>
    );
  }

  const handleToggle = (key: "autoBuyEnabled" | "autoListEnabled") => {
    const newValue = !preferences[key];
    updatePreferences({ [key]: newValue });

    addActivityLog(
      user.id,
      "INFO",
      newValue
        ? `Enabled ${key === "autoBuyEnabled" ? "auto-buy" : "auto-list"}`
        : `Disabled ${key === "autoBuyEnabled" ? "auto-buy" : "auto-list"}`
    );
  };

  const handleBudgetChange = (
    key: "maxPurchaseBudget" | "monthlyBudget" | "autoBuyThreshold" | "autoListMinPrice",
    value: string
  ) => {
    if (value === "") {
      updatePreferences({ [key]: "" });
      return;
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;
    updatePreferences({ [key]: value });
  };

  const handleAddInterest = () => {
    if (!newInterest.trim() || preferences.interests.includes(newInterest.trim().toLowerCase())) {
      return;
    }

    const updated = [...preferences.interests, newInterest.trim().toLowerCase()];
    updatePreferences({ interests: updated });
    addActivityLog(user.id, "INFO", `Added interest: ${newInterest.trim()}`);
    setNewInterest("");
  };

  const handleRemoveInterest = (interest: string) => {
    const updated = preferences.interests.filter((item) => item !== interest);
    updatePreferences({ interests: updated });
    addActivityLog(user.id, "INFO", `Removed interest: ${interest}`);
  };

  const panelInputClass =
    "focus-ring field-shell mt-2 w-full rounded-2xl px-3 py-2.5 text-sm text-text-main";
  const segmentClass = "glass-inset rounded-[1.25rem] p-4";
  const switchBaseClass = "focus-ring relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out";

  return (
    <section className="glass-panel rounded-[1.75rem] p-4 sm:p-5">
      <div className="border-b border-slate-200/80 px-2 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">Controls</p>
        <h3 className="mt-2 text-lg font-semibold text-text-main">Agent preferences</h3>
        <p className="mt-1 text-sm text-text-secondary">
          Tune automation, budget, and workload without losing control.
        </p>
      </div>

      <div className="space-y-4 px-2 pt-4">
        <div className={segmentClass}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-text-main">Auto-buy services</p>
              <p className="mt-1 text-sm leading-5 text-text-secondary">
                Automatically purchase listings that match your interests and budget rules.
              </p>
            </div>
              <button
                onClick={() => handleToggle("autoBuyEnabled")}
                type="button"
                role="switch"
                aria-checked={preferences.autoBuyEnabled}
                aria-pressed={preferences.autoBuyEnabled}
                aria-label={`Auto-buy services ${preferences.autoBuyEnabled ? "enabled" : "disabled"}`}
                className={`${switchBaseClass} ${
                  preferences.autoBuyEnabled ? "bg-brand" : "bg-slate-300 dark:bg-slate-600"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    preferences.autoBuyEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
          </div>

          {preferences.autoBuyEnabled && (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">
                  Max per transaction
                </label>
                <div className="glass-inset mt-2 flex items-center rounded-2xl px-3">
                  <span className="text-sm text-text-secondary">$</span>
                  <input
                    type="number"
                    value={preferences.maxPurchaseBudget}
                    onChange={(e) => handleBudgetChange("maxPurchaseBudget", e.target.value)}
                    className="focus-ring w-full border-0 bg-transparent px-2 py-2.5 text-sm text-text-main"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">
                  Auto-approve under
                </label>
                <div className="glass-inset mt-2 flex items-center rounded-2xl px-3">
                  <span className="text-sm text-text-secondary">$</span>
                  <input
                    type="number"
                    value={preferences.autoBuyThreshold}
                    onChange={(e) => handleBudgetChange("autoBuyThreshold", e.target.value)}
                    className="focus-ring w-full border-0 bg-transparent px-2 py-2.5 text-sm text-text-main"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={segmentClass}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-text-main">Auto-list services</p>
              <p className="mt-1 text-sm leading-5 text-text-secondary">
                Allow the agent to create sellable service listings using your floor price.
              </p>
            </div>
              <button
                onClick={() => handleToggle("autoListEnabled")}
                type="button"
                role="switch"
                aria-checked={preferences.autoListEnabled}
                aria-pressed={preferences.autoListEnabled}
                aria-label={`Auto-list services ${preferences.autoListEnabled ? "enabled" : "disabled"}`}
                className={`${switchBaseClass} ${
                  preferences.autoListEnabled ? "bg-brand" : "bg-slate-300 dark:bg-slate-600"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    preferences.autoListEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
          </div>

          {preferences.autoListEnabled && (
            <div className="mt-3">
              <label className="text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">
                Minimum price
              </label>
              <div className="glass-inset mt-2 flex items-center rounded-2xl px-3">
                <span className="text-sm text-text-secondary">$</span>
                <input
                  type="number"
                  value={preferences.autoListMinPrice || "1"}
                  onChange={(e) => handleBudgetChange("autoListMinPrice", e.target.value)}
                  className="focus-ring w-full border-0 bg-transparent px-2 py-2.5 text-sm text-text-main"
                />
              </div>
            </div>
          )}
        </div>

        <div className={segmentClass}>
          <p className="font-medium text-text-main">Monthly budget</p>
          <p className="mt-1 text-sm leading-5 text-text-secondary">
            Set a hard ceiling for total monthly spend across all purchases.
          </p>
          <div className="glass-inset mt-3 flex items-center rounded-2xl px-3">
            <span className="text-sm text-text-secondary">$</span>
            <input
              type="number"
              value={preferences.monthlyBudget}
              onChange={(e) => handleBudgetChange("monthlyBudget", e.target.value)}
              className="focus-ring w-full border-0 bg-transparent px-2 py-2.5 text-sm text-text-main"
            />
            <span className="text-sm text-text-secondary">USDC</span>
          </div>
        </div>

        <div className={segmentClass}>
          <p className="font-medium text-text-main">Interests</p>
          <p className="mt-1 text-sm leading-5 text-text-secondary">
            Guide marketplace discovery with a focused set of service categories.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {preferences.interests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/90 px-3 py-1.5 text-xs font-medium text-brand-strong dark:border-blue-900/30 dark:bg-blue-900/50 dark:text-blue-100"
              >
                {interest}
                <button
                  onClick={() => handleRemoveInterest(interest)}
                  type="button"
                  aria-label={`Remove interest ${interest}`}
                  className="focus-ring rounded-full p-0.5 text-brand-strong hover:bg-white/80 hover:text-brand-hover dark:text-blue-200 dark:hover:bg-blue-800/60 dark:hover:text-blue-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <GlassSelect
              className="flex-1"
              value={newInterest}
              onChange={(val) => setNewInterest(val)}
              placeholder="Add interest..."
              options={[
                { value: "", label: "Add interest..." },
                ...AVAILABLE_INTERESTS.filter((interest) => !preferences.interests.includes(interest)).map((category) => ({
                  value: category,
                  label: category,
                })),
              ]}
            />
            <button
              onClick={handleAddInterest}
              disabled={!newInterest}
              type="button"
              className="focus-ring rounded-2xl border border-brand bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
            >
              Add
            </button>
          </div>
        </div>

        <div className={segmentClass}>
          <p className="font-medium text-text-main">Max concurrent tasks</p>
          <p className="mt-1 text-sm leading-5 text-text-secondary">
            Limit how many tasks the agent can run at once to balance throughput and reliability.
          </p>
          <div className="mt-2">
            <GlassSelect
              value={String(preferences.maxConcurrentTasks || 3)}
              onChange={(val) => updatePreferences({ maxConcurrentTasks: parseInt(val) })}
              options={[
                { value: "1", label: "1 task" },
                { value: "2", label: "2 tasks" },
                { value: "3", label: "3 tasks" },
                { value: "5", label: "5 tasks" },
                { value: "10", label: "10 tasks" },
              ]}
            />
          </div>
        </div>

        <div className={segmentClass}>
          <p className="font-medium text-text-main">Response time</p>
          <p className="mt-1 text-sm leading-5 text-text-secondary">
            Choose the tradeoff between responsiveness and output depth.
          </p>
          <div className="mt-2 space-y-2">
            {[
              { value: "fast", label: "Fast - Quick responses, simpler outputs" },
              { value: "balanced", label: "Balanced - Good speed and quality" },
              { value: "thorough", label: "Thorough - Best quality, slower" },
            ].map((option) => (
              <label key={option.value} className="glass-inset flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-3">
                <input
                  type="radio"
                  name="responseTimePreference"
                  value={option.value}
                  checked={(preferences.responseTimePreference || "balanced") === option.value}
                  onChange={(e) =>
                    updatePreferences({
                      responseTimePreference: e.target.value as "fast" | "balanced" | "thorough",
                    })
                  }
                  className="accent-brand"
                />
                <span className="text-sm text-text-main">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
