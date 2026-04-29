"use client";

import { useState } from "react";
import Link from "next/link";

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

interface PurchaseResult {
  success: boolean;
  sessionId?: string;
  purchaseId?: string;
  transactionId?: string;
  status?: string;
  checkoutUrl?: string;
  demo?: boolean;
  accessToken?: string;
}

export function LocusPayment({ listing, sellerAgentId, buyerAgentId }: Props) {
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PurchaseResult | null>(null);

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

      if (data.checkoutUrl && (data.manual || !data.transactionId)) {
        setSessionId(data.sessionId);
        setLoading(false);
        return;
      }

      if (data.sessionId && data.status !== 'CONFIRMED') {
        if (data.checkoutUrl) {
          setSessionId(data.sessionId);
        }
      }

      if (data.transactionId || data.status === 'CONFIRMED') {
        pollPayment(data.transactionId, data.purchaseId, data.demo);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setLoading(false);
    }
  };

  const pollPayment = async (txId: string | undefined, purchaseId: string | undefined, demo?: boolean) => {
    if (demo || !txId) {
      handleSuccess(purchaseId);
      return;
    }

    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      try {
        const res = await fetch(`/api/checkout?transactionId=${txId}`);
        const data = await res.json();

        if (data.status === 'CONFIRMED') {
          handleSuccess(purchaseId);
          return;
        }

        if (data.status === 'FAILED' || data.status === 'POLICY_REJECTED') {
          setError(data.failureReason || 'Payment failed');
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

  const handleSuccess = async (purchaseId?: string) => {
    let accessToken: string | undefined;

    if (purchaseId) {
      try {
        const res = await fetch(`/api/service-access?userId=${buyerAgentId}`);
        const data = await res.json();
        const latest = data.accesses?.find((a: { purchaseId: string }) => a.purchaseId === purchaseId);
        if (latest) {
          accessToken = latest.accessToken;
        }
      } catch {}
    }

    if (!accessToken) {
      accessToken = `cusygen_${listing.id}_${crypto.randomUUID().slice(0, 12)}`;
    }

    setResult({
      success: true,
      purchaseId,
      accessToken,
      status: 'CONFIRMED'
    });
    setLoading(false);
  };

  if (result?.success) {
    return (
      <div className="rounded-none border border-green-200 bg-green-50">
        <div className="border-b border-green-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-base font-semibold text-green-800">Purchase Complete!</span>
          </div>
          <p className="mt-1 text-sm text-green-700">
            You now have access to &quot;{listing.title}&quot;
          </p>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div>
            <p className="text-xs font-medium text-green-800">Transaction</p>
            <p className="text-sm text-green-700">PAID ${listing.priceUSDC} USDC</p>
          </div>

          <div>
            <p className="text-xs font-medium text-green-800">Access Token</p>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 rounded-none bg-white px-3 py-2 text-xs font-mono text-gray-800 border border-green-200">
                {result.accessToken}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(result.accessToken || '')}
                className="rounded-none bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="rounded-none bg-white p-3 border border-green-200">
            <p className="text-xs font-medium text-green-800">Your agent is ready to use:</p>
            <ol className="mt-2 space-y-1 text-xs text-green-700 list-decimal list-inside">
              <li>Go to My Agents to start chatting</li>
              <li>Give your agent tasks to execute</li>
              <li>Get AI-powered results in real-time</li>
              <li>Service is active for 1 year</li>
            </ol>
          </div>
        </div>

        <div className="flex gap-2 border-t border-green-200 px-5 py-3">
          <Link
            href="/agents"
            className="flex-1 rounded-none bg-green-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-green-700"
          >
            Start Using Agent
          </Link>
          <Link
            href="/marketplace"
            className="flex-1 rounded-none border border-green-300 px-4 py-2 text-center text-sm font-medium text-green-700 hover:bg-white"
          >
            Browse More
          </Link>
        </div>
      </div>
    );
  }

  if (sessionId) {
    return (
      <iframe
        src={`${CHECKOUT_URL}/${sessionId}`}
        className="w-full rounded-none border border-border-main"
        style={{ minHeight: "600px" }}
        title="Locus Checkout"
      />
    );
  }

  return (
    <div className="rounded-none border border-border-main bg-gray-50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-text-main">
            Purchase this service
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Pay securely via Locus
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-brand">${listing.priceUSDC}</p>
          <p className="text-xs text-text-secondary">Locus Credits</p>
        </div>
      </div>

      <button
        onClick={createAndPay}
        disabled={loading}
        className="mt-6 w-full cursor-pointer rounded-none bg-brand py-4 text-base font-semibold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Processing payment..." : `Purchase via Locus ($${listing.priceUSDC})`}
      </button>
      
      {error && (
        <p className="mt-3 text-center text-sm text-red-500">{error}</p>
      )}
      
      <p className="mt-3 text-center text-xs text-text-secondary">
        Secure payment powered by <span className="font-medium">Locus</span>
      </p>
    </div>
  );
}