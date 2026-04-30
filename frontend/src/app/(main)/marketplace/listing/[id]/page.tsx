"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/pages/(app)";
import { LocusPayment } from "@/components/pages/(marketplace)/LocusPayment";
import { NegotiationPanel } from "@/components/pages/(app)/negotiation-panel";
import { SubscriptionPanel } from "@/components/pages/(app)/subscription-panel";
import { ReviewPanel } from "@/components/pages/(app)/review-panel";
import { useUserStore } from "@/store/user";

interface Listing {
  id: string;
  sellerAgentId: string;
  sellerName: string;
  sellerWallet: string;
  title: string;
  description: string;
  category: string;
  priceUSDC: string;
  active: boolean;
}

export default function ListingPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const { user, isConnected } = useUserStore();

  useEffect(() => {
    fetch("/api/marketplace/listings")
      .then((res) => res.json())
      .then((data) => {
        const found = data.listings?.find((item: Listing) => item.id === params.id);
        if (found) setListing(found);
        else router.push("/marketplace");
      })
      .finally(() => setLoading(false));
  }, [params.id, router]);

  if (loading || !listing) {
    return (
      <div className="page-shell min-h-screen bg-main-bg">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand" />
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand [animation-delay:150ms]" />
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  const togglePanel = (panel: "negotiation" | "subscription" | "review") => {
    setShowNegotiation(panel === "negotiation" ? !showNegotiation : false);
    setShowSubscription(panel === "subscription" ? !showSubscription : false);
    setShowReview(panel === "review" ? !showReview : false);
  };

  return (
    <div className="page-shell min-h-screen bg-main-bg">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pb-16 pt-6 sm:px-8">
        <Link href="/marketplace" className="focus-ring mb-6 inline-flex items-center gap-2 rounded-full border border-border-main bg-white/70 px-4 py-2 text-sm text-text-secondary hover:bg-white dark:bg-slate-900/70">
          <span>←</span>
          <span>Back to Marketplace</span>
        </Link>

        <section className="glass-panel-strong rounded-[1.5rem] p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <span className="inline-flex rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-strong">{listing.category}</span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-text-main">{listing.title}</h1>
              <p className="mt-2 text-base text-text-secondary">by {listing.sellerName}</p>
              <p className="mt-1 text-sm text-text-secondary">
                Wallet: {listing.sellerWallet.slice(0, 10)}...{listing.sellerWallet.slice(-8)}
              </p>
            </div>
            <div className="glass-inset rounded-[1rem] px-4 py-4 text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Price</p>
              <p className="mt-2 text-3xl font-semibold text-brand">${listing.priceUSDC}</p>
              <p className="text-sm text-text-secondary">Locus Credits</p>
            </div>
          </div>

          <div className="mt-8 border-t border-border-main pt-8">
            <h2 className="text-lg font-semibold text-text-main">About this service</h2>
            <p className="mt-4 text-base leading-8 text-text-secondary">{listing.description}</p>
          </div>

          {!isConnected || !user ? (
            <div className="mt-8 border-t border-border-main pt-8">
              <div className="rounded-[1rem] border border-amber-200 bg-amber-50/90 p-4 text-center dark:border-amber-900/60 dark:bg-amber-950/30">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Connect your wallet to make a purchase.</p>
              </div>
            </div>
          ) : (
            <div className="mt-8 space-y-6 border-t border-border-main pt-8">
              <LocusPayment listing={listing} sellerAgentId={listing.sellerAgentId} buyerAgentId={user.id} />

              {[
                {
                  key: "negotiation" as const,
                  title: "Make an Offer",
                  text: "Negotiate a custom price with the seller.",
                  open: showNegotiation,
                },
                {
                  key: "subscription" as const,
                  title: "Subscribe & Save",
                  text: "Get ongoing access with recurring billing.",
                  open: showSubscription,
                },
                {
                  key: "review" as const,
                  title: "Leave a Review",
                  text: "Rate your experience after delivery.",
                  open: showReview,
                },
              ].map((panel) => (
                <div key={panel.key}>
                  <button
                    type="button"
                    onClick={() => togglePanel(panel.key)}
                    className="focus-ring glass-inset flex w-full items-center justify-between rounded-[1rem] px-4 py-4 text-left"
                  >
                    <div>
                      <span className="font-medium text-text-main">{panel.title}</span>
                      <span className="ml-2 text-sm text-text-secondary">- {panel.text}</span>
                    </div>
                    <svg className={`h-5 w-5 text-text-secondary transition-transform ${panel.open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {panel.key === "negotiation" && panel.open && <div className="mt-4"><NegotiationPanel listing={listing} /></div>}
                  {panel.key === "subscription" && panel.open && <div className="mt-4"><SubscriptionPanel listing={listing} /></div>}
                  {panel.key === "review" && panel.open && (
                    <div className="mt-4">
                      <ReviewPanel sellerAgentId={listing.sellerAgentId} sellerName={listing.sellerName} listingId={listing.id} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <p className="mt-6 text-center text-xs text-text-secondary">Secure payment powered by Locus Checkout</p>
        </section>
      </main>
    </div>
  );
}
