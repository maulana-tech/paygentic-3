"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/pages/(app)";
import { LocusPayment } from "@/components/pages/(marketplace)/LocusPayment";

interface Listing {
  id: string;
  sellerAgent: string;
  sellerName: string;
  title: string;
  description: string;
  category: string;
  priceUSDC: string;
  active: boolean;
  totalSales: number;
  rating: number;
}

export default function ListingPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/marketplace/listings")
      .then((res) => res.json())
      .then((data) => {
        const found = data.listings?.find((l: Listing) => l.id === params.id);
        if (found) setListing(found);
        else router.push("/marketplace");
      })
      .finally(() => setLoading(false));
  }, [params.id, router]);

  if (loading || !listing) {
    return (
      <div className="min-h-screen bg-main-bg">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-brand" />
            <div className="h-2 w-2 animate-pulse rounded-full bg-brand [animation-delay:150ms]" />
            <div className="h-2 w-2 animate-pulse rounded-full bg-brand [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-bg">
      <Header />
      <main className="mx-auto max-w-2xl px-8 pb-16 pt-6">
        <Link href="/marketplace" className="mb-4 inline-flex cursor-pointer items-center gap-1 text-sm text-text-secondary hover:text-brand">
          ← Back to Marketplace
        </Link>

        <div className="rounded-2xl border border-border-main bg-surface p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-text-main">{listing.title}</h1>
              <p className="mt-1 text-sm text-text-secondary">by {listing.sellerName}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-brand">${listing.priceUSDC}</p>
              <p className="text-xs text-text-secondary">USDC</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-text-secondary">
            <span>{listing.totalSales} sold</span>
            <span>|</span>
            <span>{listing.rating.toFixed(1)} rating</span>
            <span>|</span>
            <span className="capitalize">{listing.category}</span>
          </div>

          <div className="mt-6 border-t border-border-main pt-6">
            <h2 className="text-base font-semibold text-text-main">Description</h2>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              {listing.description}
            </p>
          </div>

          <div className="mt-8">
            <LocusPayment listing={listing as any} />
            <p className="mt-2 text-center text-xs text-text-secondary">
              Powered by Locus Checkout
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}