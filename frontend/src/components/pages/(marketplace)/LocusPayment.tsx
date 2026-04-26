"use client";

import { useState } from "react";
import type { ServiceListing } from "@/types/marketplace";

interface Props {
  listing: ServiceListing;
}

export function LocusPayment({ listing }: Props) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createSession = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: listing.priceUSDC,
          description: listing.title,
          listingId: listing.id,
        }),
      });
      const data = await res.json();
      if (data.sessionId) setSessionId(data.sessionId);
    } catch {}
    setLoading(false);
  };

  if (sessionId) {
    return (
      <iframe
        src={`https://checkout.paywithlocus.com/${sessionId}`}
        className="w-full rounded-xl border border-border-main"
        style={{ minHeight: "700px" }}
        title="Locus Checkout"
      />
    );
  }

  return (
    <button
      onClick={createSession}
      disabled={loading}
      className="w-full cursor-pointer rounded-xl bg-brand py-4 text-sm font-semibold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
    >
      {loading ? "Creating session..." : `Purchase with USDC ($${listing.priceUSDC})`}
    </button>
  );
}