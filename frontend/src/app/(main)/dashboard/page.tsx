"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/pages/(app)";
import { useUserStore } from "@/store/user";
import { StatsPanel } from "@/components/pages/(app)/stats-panel";
import { PreferencesPanel } from "@/components/pages/(app)/preferences-panel";
import { ActivityLogPanel } from "@/components/pages/(app)/activity-log";
import {
  Purchase,
  Subscription,
  Listing,
  getAgentById,
  getListingById,
} from "@/data/store";

export default function DashboardPage() {
  const { user, isConnected, preferences } = useUserStore();
  const [activeTab, setActiveTab] = useState<
    "purchases" | "listings" | "subscriptions"
  >("purchases");
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [myPurchases, setMyPurchases] = useState<Purchase[]>([]);
  const [mySubscriptions, setMySubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    if (!isConnected || !user) return;

    (async () => {
      try {
        const [listingsRes, purchasesRes, subsRes] = await Promise.all([
          fetch("/api/marketplace/listings"),
          fetch("/api/service-access?userId=" + user.id),
          fetch("/api/subscriptions?userId=" + user.id),
        ]);

        const listingsData = await listingsRes.json();
        const userListings = (listingsData.listings || []).filter(
          (l: Listing) => l.userId === user!.id,
        );
        setMyListings(userListings);

        const accessData = await purchasesRes.json();
        const accesses = accessData.accesses || [];
        const purchases: Purchase[] = accesses.map((a: { purchaseId: string; listingId: string; sellerAgentId: string; buyerUserId: string; amount?: string; status: string; createdAt: string }) => ({
          id: a.purchaseId || a.listingId,
          listingId: a.listingId,
          sellerAgentId: a.sellerAgentId,
          buyerUserId: a.buyerUserId,
          amount: "0",
          status: a.status === "ACTIVE" ? "CONFIRMED" as const : "PENDING" as const,
          autoPurchased: false,
          createdAt: a.createdAt || new Date().toISOString(),
        }));
        setMyPurchases(purchases);

        const subsData = await subsRes.json();
        setMySubscriptions(subsData.subscriptions || []);
      } catch {}
    })();
  }, [user, isConnected]);

  const totalTrackedVolume = [...myPurchases, ...mySubscriptions].reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );
  const activeAutomationCount =
    Number(Boolean(preferences.autoBuyEnabled)) +
    Number(Boolean(preferences.autoListEnabled));
  const activeSubscriptions = mySubscriptions.filter(
    (subscription) => subscription.status === "ACTIVE",
  ).length;

  if (!isConnected) {
    return (
      <div className="dashboard-shell min-h-screen">
        <Header />
        <main className="relative mx-auto max-w-5xl px-6 pb-16 pt-12 sm:px-8">
          <div className="glass-panel-strong rounded-[1.5rem] p-8 text-center sm:p-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.25rem] bg-brand-light ring-1 ring-blue-100">
              <svg
                className="h-10 w-10 text-brand"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">
              Dashboard access
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-main">
              Connect your wallet
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-text-secondary">
              Connect your Locus Wallet to open the control center for
              purchases, listings, subscriptions, and agent settings.
            </p>
            <div className="mt-8 inline-flex rounded-full border border-slate-200 bg-white/75 px-4 py-2 text-sm text-text-muted dark:border-slate-700/50 dark:bg-slate-800/70 dark:text-slate-200">
              Use the “Connect Locus Wallet” button in the header.
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-shell min-h-screen">
      <Header />
      <main className="relative mx-auto max-w-7xl px-6 pb-16 pt-6 sm:px-8">
        <section className="glass-panel-strong mb-6 rounded-[1.5rem] p-6 sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">
                Agent control center
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-main sm:text-4xl">
                Your marketplace activity at a glance.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-text-secondary">
                Track purchases, monitor agent performance, and manage your Locus merchant activity from one place.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="glass-inset rounded-[1rem] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Tracked volume
              </p>
              <p className="mt-3 text-2xl font-semibold text-text-main">
                ${totalTrackedVolume.toFixed(2)}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Purchases and subscriptions combined.
              </p>
            </div>
            <div className="glass-inset rounded-[1rem] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Automation rules
              </p>
              <p className="mt-3 text-2xl font-semibold text-text-main">
                {activeAutomationCount}/2 active
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Auto-buy and auto-list controls currently enabled.
              </p>
            </div>
            <div className="glass-inset rounded-[1rem] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Recurring services
              </p>
              <p className="mt-3 text-2xl font-semibold text-text-main">
                {activeSubscriptions}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Active subscriptions awaiting the next billing cycle.
              </p>
            </div>
          </div>
        </section>

        <div className="mb-6">
          <StatsPanel />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
          <div className="space-y-6">
            <PreferencesPanel />
          </div>
          <div>
            <ActivityLogPanel maxItems={15} showFilters={true} />
          </div>
        </div>

        <section className="glass-panel mt-8 overflow-hidden rounded-[1.5rem]">
          <div className="border-b border-slate-200/80 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-main">
                  Marketplace records
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Review purchases, listings, and recurring subscriptions in one
                  place.
                </p>
              </div>
              <div
                className="flex flex-wrap gap-2"
                role="tablist"
                aria-label="Dashboard records"
              >
                {[
                  {
                    key: "purchases",
                    label: "Purchases",
                    count: myPurchases.length,
                  },
                  {
                    key: "listings",
                    label: "Listings",
                    count: myListings.length,
                  },
                  {
                    key: "subscriptions",
                    label: "Subscriptions",
                    count: mySubscriptions.length,
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    onClick={() =>
                      setActiveTab(
                        tab.key as "purchases" | "listings" | "subscriptions",
                      )
                    }
                    className={`focus-ring inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${
                      activeTab === tab.key
                        ? "border-brand bg-brand text-white"
                        : "border-slate-200 bg-white/70 text-text-muted hover:bg-white dark:border-slate-700/50 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        activeTab === tab.key
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-text-muted dark:bg-slate-700/50 dark:text-slate-300"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === "purchases" ? (
              myPurchases.length === 0 ? (
                <div className="py-14 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1rem] bg-slate-100">
                    <svg
                      className="h-8 w-8 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <p className="mb-2 text-lg font-medium text-text-main">
                    No purchases yet
                  </p>
                  <p className="mb-5 text-text-secondary">
                    You have not purchased any services yet.
                  </p>
                  <Link
                    href="/marketplace"
                    className="focus-ring inline-flex items-center gap-2 rounded-full border border-brand bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
                  >
                    <span>Browse Marketplace</span>
                    <span>→</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myPurchases.map((purchase) => {
                    const seller = getAgentById(purchase.sellerAgentId);
                    return (
                      <div
                        key={purchase.id}
                        className="glass-inset flex flex-col gap-4 rounded-[1rem] p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light">
                            <span className="text-sm font-bold text-brand">
                              ${purchase.amount}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-text-main">
                              Purchase #{purchase.id.slice(-6)}
                            </p>
                            <p className="text-sm text-text-secondary">
                              from {seller?.name || "Unknown"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                              purchase.status === "CONFIRMED"
                                ? "bg-green-100 text-green-800"
                                : purchase.status === "FAILED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {purchase.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : activeTab === "listings" ? (
              myListings.length === 0 ? (
                <div className="py-14 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1rem] bg-slate-100">
                    <svg
                      className="h-8 w-8 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <p className="mb-2 text-lg font-medium text-text-main">
                    No listings yet
                  </p>
                  <p className="mb-5 text-text-secondary">
                    Start earning by creating your first listing.
                  </p>
                  <Link
                    href="/dashboard/listing/new"
                    className="focus-ring inline-flex items-center gap-2 rounded-full border border-brand bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
                  >
                    <span>Create Listing</span>
                    <span>+</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="glass-inset flex flex-col gap-4 rounded-[1rem] p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light">
                          <span className="text-sm font-bold text-brand">
                            ${listing.priceUSDC}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-text-main">
                            {listing.title}
                          </p>
                          <p className="text-sm text-text-secondary">
                            {listing.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                            listing.active
                              ? "bg-green-100 text-green-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {listing.active ? "Active" : "Inactive"}
                        </span>
                        <span className="text-sm text-text-secondary">
                          {listing.totalSales} sales
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : mySubscriptions.length === 0 ? (
              <div className="py-14 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1rem] bg-slate-100">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <p className="mb-2 text-lg font-medium text-text-main">
                  No subscriptions yet
                </p>
                <p className="mb-5 text-text-secondary">
                  Recurring services will appear here once you subscribe to one.
                </p>
                <Link
                  href="/marketplace"
                  className="focus-ring inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-text-main hover:bg-white dark:border-slate-700/50 dark:bg-slate-800/80 dark:hover:bg-slate-800"
                >
                  Explore Services
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {mySubscriptions.map((subscription) => {
                  const listing = getListingById(subscription.listingId);
                  const seller = getAgentById(subscription.sellerAgentId);

                  return (
                    <div
                      key={subscription.id}
                      className="glass-inset flex flex-col gap-4 rounded-[1rem] p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light">
                          <span className="text-sm font-bold text-brand">
                            ${subscription.amount}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-text-main">
                            {listing?.title ||
                              `Subscription #${subscription.id.slice(-6)}`}
                          </p>
                          <p className="text-sm text-text-secondary">
                            {subscription.planType === "annual"
                              ? "Annual plan"
                              : "Monthly plan"}{" "}
                            · {seller?.name || "Unknown seller"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                            subscription.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : subscription.status === "PAUSED"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {subscription.status}
                        </span>
                        <span className="text-sm text-text-secondary">
                          Next bill{" "}
                          {new Date(
                            subscription.nextBillingDate,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
