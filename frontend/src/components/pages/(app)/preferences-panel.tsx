"use client";

import { useState } from "react";
import { useUserStore } from "@/store/user";
import { CATEGORIES, addActivityLog } from "@/data/store";

const AVAILABLE_INTERESTS = [
  'code generation',
  'data analysis',
  'content creation',
  'research',
  'automation',
  'api services',
  'custom',
  'video production',
  'analytics',
  'crm'
];

export function PreferencesPanel() {
  const { user, isConnected, preferences, updatePreferences } = useUserStore();
  const [saving, setSaving] = useState(false);
  const [newInterest, setNewInterest] = useState("");

  if (!isConnected || !user) {
    return (
      <div className="rounded-none border border-border-main bg-surface p-6 text-center">
        <p className="text-sm text-text-secondary">Connect wallet to manage preferences</p>
      </div>
    );
  }

  const handleToggle = (key: 'autoBuyEnabled' | 'autoListEnabled') => {
    const newValue = !preferences[key];
    updatePreferences({ [key]: newValue });
    
    addActivityLog(user.id, 'INFO', 
      newValue ? `Enabled ${key === 'autoBuyEnabled' ? 'auto-buy' : 'auto-list'}` : `Disabled ${key === 'autoBuyEnabled' ? 'auto-buy' : 'auto-list'}`
    );
  };

  const handleBudgetChange = (key: 'maxPurchaseBudget' | 'monthlyBudget' | 'autoBuyThreshold' | 'autoListMinPrice', value: string) => {
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
    addActivityLog(user.id, 'INFO', `Added interest: ${newInterest.trim()}`);
    setNewInterest("");
  };

  const handleRemoveInterest = (interest: string) => {
    const updated = preferences.interests.filter(i => i !== interest);
    updatePreferences({ interests: updated });
    addActivityLog(user.id, 'INFO', `Removed interest: ${interest}`);
  };

  return (
    <div className="rounded-none border border-border-main bg-surface">
      <div className="border-b border-border-main px-4 py-3">
        <h3 className="font-semibold text-text-main">Agent Preferences</h3>
        <p className="text-xs text-text-secondary">Control your agent's behavior</p>
      </div>

      <div className="divide-y divide-border-main">
        {/* Auto-Buy Toggle */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-main">Auto-Buy Services</p>
              <p className="text-xs text-text-secondary">Automatically purchase matching services</p>
            </div>
            <button
              onClick={() => handleToggle('autoBuyEnabled')}
              className={`relative h-6 w-11 rounded-none transition-colors ${
                preferences.autoBuyEnabled ? "bg-brand" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-none bg-white shadow transition-transform ${
                  preferences.autoBuyEnabled ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
          
          {preferences.autoBuyEnabled && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-secondary">Max per transaction</label>
                <div className="mt-1 flex items-center rounded-none border border-border-main bg-white px-2">
                  <span className="text-sm text-text-secondary">$</span>
                  <input
                    type="number"
                    value={preferences.maxPurchaseBudget}
                    onChange={(e) => handleBudgetChange('maxPurchaseBudget', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-text-secondary">Auto-approve under</label>
                <div className="mt-1 flex items-center rounded-none border border-border-main bg-white px-2">
                  <span className="text-sm text-text-secondary">$</span>
                  <input
                    type="number"
                    value={preferences.autoBuyThreshold}
                    onChange={(e) => handleBudgetChange('autoBuyThreshold', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Auto-List Toggle */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-main">Auto-List Services</p>
              <p className="text-xs text-text-secondary">Allow creating listings automatically</p>
            </div>
            <button
              onClick={() => handleToggle('autoListEnabled')}
              className={`relative h-6 w-11 rounded-none transition-colors ${
                preferences.autoListEnabled ? "bg-brand" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-none bg-white shadow transition-transform ${
                  preferences.autoListEnabled ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
          
          {preferences.autoListEnabled && (
            <div className="mt-3">
              <label className="text-xs text-text-secondary">Minimum price to auto-list</label>
              <div className="mt-1 flex items-center rounded-none border border-border-main bg-white px-2">
                <span className="text-sm text-text-secondary">$</span>
                <input
                  type="number"
                  value={preferences.autoListMinPrice || '1'}
                  onChange={(e) => handleBudgetChange('autoListMinPrice', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Monthly Budget */}
        <div className="p-4">
          <div>
            <p className="font-medium text-text-main">Monthly Budget</p>
            <p className="text-xs text-text-secondary">Maximum spending per month</p>
            <div className="mt-2 flex items-center rounded-none border border-border-main bg-white px-2">
              <span className="text-sm text-text-secondary">$</span>
              <input
                type="number"
                value={preferences.monthlyBudget}
                onChange={(e) => handleBudgetChange('monthlyBudget', e.target.value)}
                className="w-full px-2 py-1.5 text-sm outline-none"
              />
              <span className="text-sm text-text-secondary">USDC</span>
            </div>
          </div>
        </div>

        {/* Interests */}
        <div className="p-4">
          <p className="font-medium text-text-main">Interests</p>
          <p className="text-xs text-text-secondary">Services your agent should look for</p>
          
          <div className="mt-3 flex flex-wrap gap-2">
            {preferences.interests.map((interest) => (
              <span
                key={interest}
                className="flex items-center gap-1 rounded-none bg-brand-light px-3 py-1 text-xs font-medium text-brand"
              >
                {interest}
                <button
                  onClick={() => handleRemoveInterest(interest)}
                  className="ml-1 hover:text-brand-hover"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <select
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              className="flex-1 rounded-none border border-border-main bg-white px-3 py-2 text-sm"
            >
              <option value="">Add interest...</option>
              {AVAILABLE_INTERESTS.filter(i => !preferences.interests.includes(i)).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button
              onClick={handleAddInterest}
              disabled={!newInterest}
              className="rounded-none bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>

        {/* Max Concurrent Tasks */}
        <div className="p-4">
          <p className="font-medium text-text-main">Max Concurrent Tasks</p>
          <p className="text-xs text-text-secondary">How many tasks agent can run in parallel</p>
          <div className="mt-2">
            <select
              value={preferences.maxConcurrentTasks || 3}
              onChange={(e) => updatePreferences({ maxConcurrentTasks: parseInt(e.target.value) })}
              className="w-full rounded-none border border-border-main bg-white px-3 py-2 text-sm"
            >
              <option value={1}>1 task</option>
              <option value={2}>2 tasks</option>
              <option value={3}>3 tasks</option>
              <option value={5}>5 tasks</option>
              <option value={10}>10 tasks</option>
            </select>
          </div>
        </div>

        {/* Response Time Preference */}
        <div className="p-4">
          <p className="font-medium text-text-main">Response Time</p>
          <p className="text-xs text-text-secondary">Speed vs quality tradeoff</p>
          <div className="mt-2 space-y-2">
            {[
              { value: 'fast', label: 'Fast - Quick responses, simpler outputs' },
              { value: 'balanced', label: 'Balanced - Good speed and quality' },
              { value: 'thorough', label: 'Thorough - Best quality, slower' }
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="responseTimePreference"
                  value={opt.value}
                  checked={(preferences.responseTimePreference || 'balanced') === opt.value}
                  onChange={(e) => updatePreferences({ responseTimePreference: e.target.value as 'fast' | 'balanced' | 'thorough' })}
                  className="accent-brand"
                />
                <span className="text-sm text-text-main">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}