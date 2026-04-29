"use client";

import { useState, useRef, useEffect } from "react";
import { useUserStore } from "@/store/user";
import { User, addActivityLog } from "@/data/store";

const LOCUS_WALLET_URL = process.env.NEXT_PUBLIC_LOCUS_WALLET_URL || 'https://beta-pay.paywithlocus.com';

export function LocusWalletConnect() {
  const { user, setUser, isConnected, disconnect } = useUserStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [walletInput, setWalletInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isConnected) {
      fetchBalance();
      const interval = setInterval(fetchBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const fetchBalance = async () => {
    try {
      const res = await fetch('/api/locus/balance');
      const data = await res.json();
      setBalance(data.balance);
    } catch {}
  };

  const handleLocusConnect = () => {
    window.open(LOCUS_WALLET_URL, '_blank', 'width=400,height=600');
    fetchLocusWallet();
  };

  const fetchLocusWallet = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/locus/wallet');
      const data = await res.json();

      if (data.walletAddress) {
        const newUser: User = {
          id: `locus_${crypto.randomUUID().slice(0, 8)}`,
          walletAddress: data.walletAddress.toLowerCase(),
          createdAt: new Date().toISOString()
        };
        setUser(newUser);
        addActivityLog(newUser.id, 'INFO', 'Connected via Locus Wallet');
        setShowDropdown(false);
        setBalance(data.balance);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleDemoConnect = () => {
    const demoAddr = "0x742d35Cc6634C0532925aDbp3049gD5EWt250N2Oa";
    const newUser: User = {
      id: `user_${crypto.randomUUID().slice(0, 8)}`,
      walletAddress: demoAddr.toLowerCase(),
      createdAt: new Date().toISOString()
    };
    setUser(newUser);
    addActivityLog(newUser.id, 'INFO', 'Connected with demo wallet');
    setShowDropdown(false);
  };

  const handleManualConnect = () => {
    const addr = walletInput.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      setError("Invalid wallet address (0x + 40 hex chars)");
      return;
    }
    const newUser: User = {
      id: `user_${crypto.randomUUID().slice(0, 8)}`,
      walletAddress: addr.toLowerCase(),
      createdAt: new Date().toISOString()
    };
    setUser(newUser);
    addActivityLog(newUser.id, 'INFO', 'Connected with manual address');
    setShowDropdown(false);
    setWalletInput("");
    setError(null);
  };

  if (isConnected && user) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="top-nav-shell flex items-center gap-2 rounded-full px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
          <span className="text-sm font-mono text-text-main">
            {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
          </span>
          {balance !== null && (
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              {balance} USDC
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => { disconnect(); setBalance(null); }}
          className="focus-ring top-nav-shell rounded-full px-3 py-2 text-sm text-text-secondary hover:text-text-main"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="focus-ring rounded-full border border-brand bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-hover"
      >
        Connect Wallet
      </button>

      {showDropdown && (
        <div className="glass-panel-strong absolute right-0 top-full z-50 mt-3 w-80 rounded-[1.5rem] p-4">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-main">Locus Wallet</p>
              <p className="text-xs text-text-secondary">Powered by Locus on Base</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLocusConnect}
            disabled={loading}
            className="focus-ring mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-brand bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {loading ? 'Connecting...' : 'Connect with Locus'}
          </button>

          <div className="mb-3 flex items-center gap-2">
            <div className="h-px flex-1 bg-border-main"></div>
            <span className="text-xs text-text-secondary">or</span>
            <div className="h-px flex-1 bg-border-main"></div>
          </div>

          <p className="mb-2 text-xs text-text-secondary">Enter wallet address:</p>
          <input
            type="text"
            value={walletInput}
            onChange={(e) => setWalletInput(e.target.value)}
            placeholder="0x..."
            className="focus-ring w-full rounded-2xl border border-border-main bg-white/80 px-3 py-2.5 text-sm font-mono text-text-main"
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleDemoConnect}
              className="focus-ring flex-1 rounded-2xl border border-border-main bg-white/70 px-3 py-2.5 text-sm font-medium text-text-main hover:bg-white"
            >
              Demo
            </button>
            <button
              type="button"
              onClick={handleManualConnect}
              className="focus-ring flex-1 rounded-2xl border border-brand bg-brand px-3 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
            >
              Connect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
