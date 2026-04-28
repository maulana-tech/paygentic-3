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

  if (!isConnected || !user) {
    return null;
  }

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
          buyerMessage: message
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to submit offer");
        return;
      }
      
      setOfferSent(true);
    } catch (err) {
      setError("Failed to submit offer");
    } finally {
      setSubmitting(false);
    }
  };

  if (offerSent) {
    return (
      <div className="mt-6 rounded-none border border-green-300 bg-green-50 p-4">
        <div className="flex items-center gap-2 text-green-700">
          <span>✓</span>
          <span className="font-semibold">Offer submitted!</span>
        </div>
        <p className="mt-1 text-sm text-green-600">
          Your offer of ${offerPrice} USDC has been sent to the seller.
        </p>
        <button
          onClick={() => setOfferSent(false)}
          className="mt-3 text-sm text-green-700 underline"
        >
          Make another offer
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-none border border-border-main bg-gray-50 p-4">
      <h3 className="font-semibold text-text-main">Make an Offer</h3>
      <p className="mt-1 text-xs text-text-secondary">
        Negotiate a custom price with the seller
      </p>
      
      <div className="mt-4">
        <label className="text-sm text-text-secondary">Your offer (USDC)</label>
        <div className="mt-1 flex items-center rounded-none border border-border-main bg-white px-3">
          <span className="text-text-secondary">$</span>
          <input
            type="number"
            step="0.01"
            value={offerPrice}
            onChange={(e) => setOfferPrice(e.target.value)}
            className="w-full px-2 py-2 text-sm outline-none"
          />
        </div>
      </div>
      
      <div className="mt-3">
        <label className="text-sm text-text-secondary">Message (optional)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell the seller why you're making this offer..."
          className="mt-1 w-full rounded-none border border-border-main bg-white px-3 py-2 text-sm outline-none"
          rows={2}
        />
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      
      <button
        onClick={handleSubmitOffer}
        disabled={submitting}
        className="mt-4 w-full rounded-none bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-50"
      >
        {submitting ? "Sending..." : "Submit Offer"}
      </button>
      
      <p className="mt-2 text-center text-xs text-text-secondary">
        Original price: ${listing.priceUSDC} USDC
      </p>
    </div>
  );
}