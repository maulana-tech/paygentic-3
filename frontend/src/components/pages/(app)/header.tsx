"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LocusWalletConnect } from "./locus-wallet-connect";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/agents", label: "My Agents" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Header() {
  const pathname = usePathname();

return (
    <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Logo - Left */}
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-none bg-blue-600">
          <span className="text-sm font-bold text-white">C</span>
        </div>
        <span className="text-base font-semibold text-gray-900">Cusygen</span>
      </Link>

      {/* Nav - Center */}
      <nav className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-none px-4 py-2 text-sm font-medium transition-colors ${
              pathname === item.href
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Wallet Connect - Right */}
      <LocusWalletConnect />
    </header>
  );
}