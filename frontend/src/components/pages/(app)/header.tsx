"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LocusWalletConnect } from "./locus-wallet-connect";
import { ThemeToggle } from "./theme-toggle";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/agents", label: "My Agents" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="top-nav-shell mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-[1.75rem] px-4 py-3 sm:px-5">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-sm font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-[1.04] group-hover:rotate-[-4deg]">
            C
          </div>
          <div>
            <span className="block text-sm font-semibold tracking-[0.18em] text-text-secondary">CUSYGEN</span>
            <span className="block text-sm text-text-main">AI service workspace</span>
          </div>
        </Link>

        <nav className="top-nav-shell hidden items-center gap-1 rounded-full px-2 py-2 lg:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`focus-ring relative rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-brand text-white shadow-sm"
                    : "text-text-secondary hover:-translate-y-0.5 hover:bg-white/70 hover:text-text-main dark:hover:bg-slate-800/80"
                }`}
              >
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <LocusWalletConnect />
        </div>
      </div>

      <div className="mx-auto mt-3 flex max-w-7xl lg:hidden">
        <nav className="top-nav-shell flex w-full items-center gap-1 overflow-x-auto rounded-full px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`focus-ring whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-brand text-white shadow-sm"
                    : "text-text-secondary hover:bg-white/70 hover:text-text-main dark:hover:bg-slate-800/80"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
