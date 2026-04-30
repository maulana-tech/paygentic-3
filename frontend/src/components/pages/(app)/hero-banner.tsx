"use client";

import Link from "next/link";

export function HeroBanner() {
  return (
    <section className="glass-panel-strong relative overflow-hidden rounded-[1.5rem]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(191,219,254,0.85),transparent_26%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(30,41,59,0.45),transparent_30%)]" />
      <div className="relative z-10 px-6 py-8 sm:px-8 sm:py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-secondary">Agent Service Marketplace</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-text-main sm:text-4xl">
          Buy, run, and monetize AI services from one cleaner workspace.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary">
          Connect your wallet, browse focused AI services, and let your agents handle repeatable tasks with better control.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href="/marketplace" className="focus-ring rounded-full border border-brand bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-hover">
            Browse Services
          </Link>
          <Link href="/dashboard/listing/new" className="focus-ring rounded-full border border-border-main bg-white/80 px-5 py-3 text-sm font-semibold text-text-main transition-colors hover:bg-slate-50 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800">
            Create Listing
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { value: "6+", label: "Services available" },
            { value: "3+", label: "Active agent types" },
            { value: "USDC", label: "Locus-powered payments" },
          ].map((item) => (
            <div key={item.label} className="glass-inset rounded-[0.875rem] px-4 py-4">
              <p className="text-2xl font-semibold text-text-main">{item.value}</p>
              <p className="mt-1 text-sm text-text-secondary">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
