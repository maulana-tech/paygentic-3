"use client";

import { useState } from "react";

interface Listing {
  id: string;
  title: string;
  priceUSDC: string;
}

interface Props {
  listing: Listing;
  sellerAgentId: string;
  buyerAgentId: string;
}

const CHECKOUT_URL = 'https://beta-checkout.paywithlocus.com';

export function LocusPayment({ listing, sellerAgentId, buyerAgentId }: Props) {
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [purchased, setPurchased] = useState(false);

  const createAndPay = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: listing.priceUSDC,
          description: listing.title,
          listingId: listing.id,
          sellerAgentId,
          buyerAgentId,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      // If manual checkout required, show checkout URL
      if (data.checkoutUrl && (data.manual || !data.transactionId)) {
        setSessionId(data.sessionId);
        setLoading(false);
        return;
      }

      if (data.sessionId) {
        if (data.status === 'CONFIRMED') {
          setPurchased(true);
          setLoading(false);
          return;
        }

        if (data.checkoutUrl) {
          setSessionId(data.sessionId);
        }
      }

      if (data.transactionId) {
        pollPayment(data.transactionId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setLoading(false);
    }
  };

  const pollPayment = async (txId: string) => {
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      try {
        const res = await fetch(`/api/checkout?transactionId=${txId}`);
        const data = await res.json();

        if (data.status === 'CONFIRMED') {
          setPurchased(true);
          setLoading(false);
          return;
        }

        if (data.status === 'FAILED') {
          setError(data.failureReason || 'Payment failed');
          setLoading(false);
          return;
        }

        if (data.status === 'POLICY_REJECTED') {
          setError('Policy rejected - requires approval');
          setLoading(false);
          return;
        }
      } catch {}

      await new Promise(r => setTimeout(r, 2000));
      attempts++;
    }

    setError('Payment timeout');
    setLoading(false);
  };

  if (purchased) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-lg font-semibold text-green-700">Purchase Complete!</p>
        <p className="mt-1 text-sm text-green-600">Thank you for your purchase.</p>
      </div>
    );
  }

  if (sessionId) {
    return (
      <iframe
        src={`${CHECKOUT_URL}/${sessionId}`}
        className="w-full rounded-xl border border-border-main"
        style={{ minHeight: "600px" }}
        title="Locus Checkout"
      />
    );
  }

  return (
    <div className="rounded border border-border-main bg-gray-50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-text-main">
            Purchase this service
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Secure payment with USDC
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-brand">${listing.priceUSDC}</p>
          <p className="text-xs text-text-secondary">USDC</p>
        </div>
      </div>

      <button
        onClick={createAndPay}
        disabled={loading}
        className="mt-6 w-full cursor-pointer rounded-md bg-brand py-4 text-base font-semibold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Processing payment..." : `Purchase with USDC ($${listing.priceUSDC})`}
      </button>
      
      {error && (
        <p className="mt-3 text-center text-sm text-red-500">{error}</p>
      )}
      
      <p className="mt-3 text-center text-xs text-text-secondary">
        Secure payment powered by Locus Checkout
      </p>
    </div>
  );
}