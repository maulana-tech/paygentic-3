"use client";

import { useState } from "react";
import Link from "next/link";
import { useUserStore } from "@/store/user";

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

const CHECKOUT_URL = "https://beta-checkout.paywithlocus.com";

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
  const addOwnedAgent = useUserStore((s) => s.addOwnedAgent);
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

      if (data.sessionId && data.status !== "CONFIRMED" && data.checkoutUrl) {
        setSessionId(data.sessionId);
      }

      if (data.transactionId || data.status === "CONFIRMED") {
        pollPayment(data.transactionId, data.purchaseId, data.demo);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
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

        if (data.status === "CONFIRMED") {
          handleSuccess(purchaseId);
          return;
        }

        if (data.status === "FAILED" || data.status === "POLICY_REJECTED") {
          setError(data.failureReason || "Payment failed");
          setLoading(false);
          return;
        }
      } catch {}

      await new Promise((resolve) => setTimeout(resolve, 2000));
      attempts++;
    }

    setError("Payment timeout");
    setLoading(false);
  };

  const handleSuccess = async (purchaseId?: string) => {
    let accessToken: string | undefined;
    let serverId: string | undefined;

    if (purchaseId) {
      try {
        const res = await fetch(`/api/service-access?userId=${buyerAgentId}`);
        const data = await res.json();
        const latest = data.accesses?.find((item: { purchaseId: string; id: string; accessToken: string }) => item.purchaseId === purchaseId);
        if (latest) {
          accessToken = latest.accessToken;
          serverId = latest.id;
        }
      } catch {}
    }

    if (!accessToken) {
      accessToken = `cusygen_${listing.id}_${crypto.randomUUID().slice(0, 12)}`;
    }

    const now = new Date().toISOString();
    addOwnedAgent({
      id: serverId ?? `acc_${crypto.randomUUID().slice(0, 8)}`,
      purchaseId: purchaseId || '',
      listingId: listing.id,
      sellerAgentId,
      accessToken,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      accessTokenCreated: now,
    });

    setResult({
      success: true,
      purchaseId,
      accessToken,
      status: "CONFIRMED",
    });
    setLoading(false);
  };

  if (result?.success) {
    return (
      <div className="glass-panel rounded-[1.25rem] border border-emerald-200/70">
        <div className="border-b border-emerald-200/70 px-5 py-4 dark:border-emerald-900/70">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-emerald-700 dark:text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-base font-semibold text-emerald-800 dark:text-emerald-300">Purchase complete</span>
          </div>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
            You now have access to &quot;{listing.title}&quot;
          </p>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-800 dark:text-emerald-300">Transaction</p>
            <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">Paid ${listing.priceUSDC} USDC</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-800 dark:text-emerald-300">Access token</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="field-shell flex-1 rounded-xl px-3 py-3 text-xs font-mono text-text-main">
                {result.accessToken}
              </code>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(result.accessToken || "")}
                className="focus-ring rounded-xl border border-emerald-600 bg-emerald-600 px-3 py-3 text-xs font-medium text-white hover:bg-emerald-700"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="glass-inset rounded-[0.875rem] p-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">Next steps</p>
            <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-text-secondary">
              <li>Go to My Agents to start chatting.</li>
              <li>Give your agent a concrete task.</li>
              <li>Review results and continue the workflow.</li>
              <li>Service remains active for 1 year.</li>
            </ol>
          </div>
        </div>

        <div className="flex gap-2 border-t border-emerald-200/70 px-5 py-3 dark:border-emerald-900/70">
          <Link href="/agents" className="focus-ring flex-1 rounded-full border border-emerald-600 bg-emerald-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-emerald-700">
            Start Using Agent
          </Link>
          <Link href="/marketplace" className="focus-ring flex-1 rounded-full border border-border-main bg-white/80 px-4 py-2.5 text-center text-sm font-medium text-text-main hover:bg-white dark:bg-slate-900/70">
            Browse More
          </Link>
        </div>
      </div>
    );
  }

  if (sessionId) {
    return <iframe src={`${CHECKOUT_URL}/${sessionId}`} className="w-full rounded-[1rem] border border-border-main" style={{ minHeight: "600px" }} title="Locus Checkout" />;
  }

  return (
    <div className="glass-inset rounded-[0.875rem] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-text-main">Purchase this service</p>
          <p className="mt-1 text-sm text-text-secondary">Pay securely via Locus.</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold text-brand">${listing.priceUSDC}</p>
          <p className="text-xs text-text-secondary">Locus Credits</p>
        </div>
      </div>

      <button
        type="button"
        onClick={createAndPay}
        disabled={loading}
        className="focus-ring mt-6 w-full rounded-full border border-brand bg-brand py-4 text-base font-semibold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Processing payment..." : `Purchase via Locus ($${listing.priceUSDC})`}
      </button>

      {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}
      <p className="mt-3 text-center text-xs text-text-secondary">Secure payment powered by <span className="font-medium text-text-main">Locus</span></p>
    </div>
  );
}
