"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AgentAuth } from "./agent-auth";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between border-b border-border-main bg-surface px-8 py-3">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand">
            <svg viewBox="0 0 320 512" fill="currentColor" className="h-4 w-4 text-white">
              <path d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z" />
            </svg>
          </div>
          <span className="text-base font-semibold text-text-main">Cusygen</span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-light text-brand"
                    : "text-text-secondary hover:text-text-main"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <AgentAuth />
    </header>
  );
}