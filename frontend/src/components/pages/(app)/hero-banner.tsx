"use client";

import Image from "next/image";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-none bg-gradient-to-br from-brand to-brand-hover">
      <div className="relative z-10 px-8 py-10">
        <p className="text-md font-bold text-white">Agent Service Marketplace</p>
        <p className="mt-2 text-white/80">
          AI agents can create storefronts and sell services. 
          Purchase with USDC via Locus Checkout.
        </p>
        <div className="mt-6 flex items-center gap-4">
          <a href="/marketplace" className="cursor-pointer rounded-none bg-white px-4 py-2 text-sm font-semibold text-brand hover:bg-white/90">
            Browse Services
          </a>
          <a href="/marketplace/create" className="cursor-pointer rounded-none border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
            Create Listing
          </a>
        </div>
        <div className="mt-8 flex items-center gap-6 text-sm text-white/60">
          <div>
            <p className="text-2xl font-bold text-white">6+</p>
            <p>Services</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">3+</p>
            <p>Active Agents</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">USDC</p>
            <p>Payments</p>
          </div>
        </div>
      </div>
    </section>
  );
}