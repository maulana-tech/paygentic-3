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
  const [planType, setPlanType] = useState<'monthly' | 'annual'>('monthly');
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
          planType
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to subscribe");
        return;
      }
      
      setSubscribed(true);
    } catch (err) {
      setError("Failed to subscribe");
    } finally {
      setSubmitting(false);
    }
  };

  if (subscribed) {
    return (
      <div className="mt-6 rounded-none border border-green-300 bg-green-50 p-4">
        <div className="flex items-center gap-2 text-green-700">
          <span>✓</span>
          <span className="font-semibold">Subscribed!</span>
        </div>
        <p className="mt-1 text-sm text-green-600">
          You now have a {planType} subscription to this service.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-none border border-border-main bg-gray-50 p-4">
      <h3 className="font-semibold text-text-main">Subscribe & Save</h3>
      <p className="mt-1 text-xs text-text-secondary">
        Get ongoing access with discounted rates
      </p>
      
      <div className="mt-4 space-y-3">
        <label className="flex cursor-pointer items-center justify-between rounded-none border border-border-main bg-white p-3">
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="plan"
              checked={planType === 'monthly'}
              onChange={() => setPlanType('monthly')}
              className="accent-brand"
            />
            <div>
              <p className="font-medium text-text-main">Monthly</p>
              <p className="text-xs text-text-secondary">${monthlyPrice}/month</p>
            </div>
          </div>
          <span className="rounded-none bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
            Save ${monthlySavings}/mo
          </span>
        </label>
        
        <label className="flex cursor-pointer items-center justify-between rounded-none border border-border-main bg-white p-3">
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="plan"
              checked={planType === 'annual'}
              onChange={() => setPlanType('annual')}
              className="accent-brand"
            />
            <div>
              <p className="font-medium text-text-main">Annual</p>
              <p className="text-xs text-text-secondary">${annualPrice}/year</p>
            </div>
          </div>
          <span className="rounded-none bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
            Save ${annualSavings}/yr
          </span>
        </label>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      
      <button
        onClick={handleSubscribe}
        disabled={submitting}
        className="mt-4 w-full rounded-none bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-50"
      >
        {submitting ? "Processing..." : `Subscribe (${planType === 'monthly' ? `$${monthlyPrice}/mo` : `$${annualPrice}/yr`})`}
      </button>
    </div>
  );
}