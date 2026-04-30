"use client";

import { useState } from "react";

interface SubscriptionPanelProps {
  listing: {
    id: string;
    priceUSDC: string;
    title: string;
  };
}

export function SubscriptionPanel({ listing }: SubscriptionPanelProps) {
  const [planType, setPlanType] = useState<"monthly" | "annual">("monthly");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  const originalPrice = parseFloat(listing.priceUSDC);
  const monthlyPrice = (originalPrice * 0.6).toFixed(2);
  const annualPrice = (originalPrice * 6).toFixed(2);
  const monthlySavings = (originalPrice - parseFloat(monthlyPrice)).toFixed(2);
  const annualSavings = (originalPrice * 12 - parseFloat(annualPrice)).toFixed(2);

  const handleSubscribe = async () => {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          buyerUserId: "demo-user",
          planType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to subscribe");
        return;
      }

      setSubscribed(true);
    } catch {
      setError("Failed to subscribe");
    } finally {
      setSubmitting(false);
    }
  };

  if (subscribed) {
    return (
      <div className="glass-panel rounded-[1rem] border border-emerald-200/70 p-4 dark:border-emerald-900/70">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
          <span>✓</span>
          <span className="font-semibold">Subscribed</span>
        </div>
        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">You now have a {planType} subscription to this service.</p>
      </div>
    );
  }

  return (
    <div className="glass-inset rounded-[1rem] p-5">
      <h3 className="font-semibold text-text-main">Subscribe & Save</h3>
      <p className="mt-1 text-sm text-text-secondary">Get ongoing access with discounted rates.</p>

      <div className="mt-4 space-y-3">
        {[
          {
            key: "monthly" as const,
            title: "Monthly",
            subtitle: `${monthlyPrice}/month`,
            saving: `Save $${monthlySavings}/mo`,
          },
          {
            key: "annual" as const,
            title: "Annual",
            subtitle: `${annualPrice}/year`,
            saving: `Save $${annualSavings}/yr`,
          },
        ].map((plan) => (
          <label key={plan.key} className="field-shell flex cursor-pointer items-center justify-between rounded-[0.875rem] p-4">
            <div className="flex items-center gap-3">
              <input type="radio" name="plan" checked={planType === plan.key} onChange={() => setPlanType(plan.key)} className="accent-brand" />
              <div>
                <p className="font-medium text-text-main">{plan.title}</p>
                <p className="text-sm text-text-secondary">${plan.subtitle}</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
              {plan.saving}
            </span>
          </label>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleSubscribe}
        disabled={submitting}
        className="focus-ring mt-5 w-full rounded-full border border-brand bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-50"
      >
        {submitting ? "Processing..." : `Subscribe (${planType === "monthly" ? `$${monthlyPrice}/mo` : `$${annualPrice}/yr`})`}
      </button>
    </div>
  );
}
