"use client";

import { useState } from "react";
import { useUserStore } from "@/store/user";

interface NegotiationPanelProps {
  listing: {
    id: string;
    priceUSDC: string;
    title: string;
  };
}

export function NegotiationPanel({ listing }: NegotiationPanelProps) {
  const { user, isConnected } = useUserStore();
  const [offerPrice, setOfferPrice] = useState(listing.priceUSDC);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [offerSent, setOfferSent] = useState(false);
  const [error, setError] = useState("");

  if (!isConnected || !user) return null;

  const handleSubmitOffer = async () => {
    if (!user) return;

    const price = parseFloat(offerPrice);
    if (isNaN(price) || price <= 0) {
      setError("Please enter a valid price");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/negotiations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          buyerUserId: user.id,
          offeredPrice: offerPrice,
          buyerMessage: message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit offer");
        return;
      }

      setOfferSent(true);
    } catch {
      setError("Failed to submit offer");
    } finally {
      setSubmitting(false);
    }
  };

  if (offerSent) {
    return (
      <div className="glass-panel rounded-[1.5rem] border border-emerald-200/70 p-4 dark:border-emerald-900/70">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
          <span>✓</span>
          <span className="font-semibold">Offer submitted</span>
        </div>
        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">Your offer of ${offerPrice} USDC has been sent to the seller.</p>
        <button type="button" onClick={() => setOfferSent(false)} className="focus-ring mt-3 rounded-full bg-emerald-100 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
          Make another offer
        </button>
      </div>
    );
  }

  return (
    <div className="glass-inset rounded-[1.5rem] p-5">
      <h3 className="font-semibold text-text-main">Make an offer</h3>
      <p className="mt-1 text-sm text-text-secondary">Negotiate a custom price with the seller.</p>

      <div className="mt-4">
        <label className="text-sm font-medium text-text-main">Your offer (USDC)</label>
        <div className="field-shell mt-2 flex items-center rounded-2xl px-3">
          <span className="text-text-secondary">$</span>
          <input
            type="number"
            step="0.01"
            value={offerPrice}
            onChange={(e) => setOfferPrice(e.target.value)}
            className="focus-ring w-full border-0 bg-transparent px-2 py-3 text-sm text-text-main"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium text-text-main">Message (optional)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell the seller why you're making this offer..."
          className="focus-ring field-shell mt-2 w-full rounded-2xl px-3 py-3 text-sm text-text-main"
          rows={3}
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleSubmitOffer}
        disabled={submitting}
        className="focus-ring mt-5 w-full rounded-full border border-brand bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-50"
      >
        {submitting ? "Sending..." : "Submit Offer"}
      </button>

      <p className="mt-2 text-center text-xs text-text-secondary">Original price: ${listing.priceUSDC} USDC</p>
    </div>
  );
}
