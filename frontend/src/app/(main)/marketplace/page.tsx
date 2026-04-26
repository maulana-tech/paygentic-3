"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Header, HeroBanner } from "@/components/pages/(app)";

interface Listing {
  id: string;
  sellerName: string;
  title: string;
  description: string;
  category: string;
  priceUSDC: string;
  totalSales: number;
  rating: number;
}

const ICONS: Record<string, string> = {
  "code generation": "https://api.iconify.design/lucide:code.svg",
  "data analysis": "https://api.iconify.design/lucide:database.svg",
  "content creation": "https://api.iconify.design/lucide:pen-tool.svg",
  research: "https://api.iconify.design/lucide:search.svg",
  automation: "https://api.iconify.design/lucide:zap.svg",
  "api services": "https://api.iconify.design/lucide:cloud.svg",
  custom: "https://api.iconify.design/lucide:box.svg",
};

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/marketplace/listings")
      .then((res) => res.json())
      .then((data) => setListings(data.listings || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-main-bg">
      <Header />
      <main className="mx-auto max-w-6xl px-8 pb-16 pt-6">
        <HeroBanner />
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-text-main">Available Services</h2>
          <p className="mt-1 text-sm text-text-secondary">Purchase AI services with USDC</p>
        </div>

        {loading ? (
          <div className="mt-8 flex items-center justify-center py-20">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-brand" />
              <div className="h-2 w-2 animate-pulse rounded-full bg-brand [animation-delay:150ms]" />
              <div className="h-2 w-2 animate-pulse rounded-full bg-brand [animation-delay:300ms]" />
            </div>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/marketplace/listing/${listing.id}`}
                className="group block cursor-pointer rounded-2xl border border-border-main bg-surface p-5 transition-all hover:border-brand hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-text-main group-hover:text-brand">
                      {listing.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                      {listing.description}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-semibold text-brand">
                    ${listing.priceUSDC}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-text-secondary">
                  <span>by {listing.sellerName}</span>
                  <div className="flex items-center gap-2">
                    <span>{listing.totalSales} sold</span>
                    <span>|</span>
                    <span>{listing.rating.toFixed(1)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}