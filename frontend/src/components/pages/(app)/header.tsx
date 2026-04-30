"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const activePath = pendingPath ?? pathname;

  useEffect(() => {
    if (pendingPath === pathname) {
      setPendingPath(null);
    }
  }, [pathname, pendingPath]);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-white border border-border-main px-4 py-2 dark:bg-white/10">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-[1.04] group-hover:rotate-[-4deg]">
              <Image
                src="/Assets/Images/Logo/stETH-logo.svg"
                alt="stETH"
                width={24}
                height={24}
                className="h-6 w-6"
              />
            </div>
            <div>
              <span className="block text-sm font-semibold tracking-[0.18em] text-text-muted">CUSYGEN</span>
            </div>
          </Link>

          <nav className="relative hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = activePath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setPendingPath(item.href)}
                  className={`focus-ring relative z-10 rounded-full px-4 py-2.5 text-sm font-medium transition-[color,transform] duration-300 ${
                    isActive
                      ? "text-text-main dark:text-white font-bold"
                      : "nav-inactive text-text-secondary hover:text-text-main"
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

        <div className="mt-3 lg:hidden">
          <nav className="relative flex w-full items-center justify-between gap-1 overflow-x-auto rounded-xl bg-white p-1.5 border border-border-main dark:bg-white/10">
            {NAV_ITEMS.map((item) => {
              const isActive = activePath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setPendingPath(item.href)}
                  className={`focus-ring relative z-10 whitespace-nowrap rounded-full px-4 py-2.5 text-sm transition-[color,transform] duration-300 ${
                    isActive
                      ? "text-text-main dark:text-white font-bold"
                      : "nav-inactive text-text-secondary hover:text-text-main font-medium"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
