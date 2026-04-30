"use client";

import { useState, useRef, useEffect } from "react";
import { useUserStore } from "@/store/user";
import { User, addActivityLog } from "@/data/store";

const LOCUS_WALLET_URL = process.env.NEXT_PUBLIC_LOCUS_WALLET_URL || 'https://beta-pay.paywithlocus.com';

export function LocusWalletConnect() {
  const { user, setUser, isConnected, disconnect } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [walletInput, setWalletInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setShowBalance(false);
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
    window.open(LOCUS_WALLET_URL, '_blank', 'width=420,height=650');
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
      setError("Invalid address — must be 0x + 40 hex characters");
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

  const copyAddress = () => {
    if (user) {
      navigator.clipboard.writeText(user.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (mounted && isConnected && user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setShowBalance(!showBalance)}
          className="focus-ring surface-card-soft flex h-11 w-[11.5rem] cursor-pointer items-center justify-between gap-2 rounded-full px-3 py-2 transition-colors duration-200 hover:bg-white/80 dark:hover:bg-slate-800/80"
        >
          <div className="flex min-w-0 items-center gap-2">
            <div className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
            <span className="truncate text-sm font-mono text-text-main">
              {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
            </span>
          </div>
          <svg
            className={`h-3.5 w-3.5 shrink-0 text-text-secondary transition-transform duration-200 ${showBalance ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showBalance && (
          <div className="glass-panel-strong absolute right-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-[1rem]">
            <div className="flex items-center justify-between border-b border-border-main px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand">
                  <span className="text-xs font-bold text-white">L</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-main">Locus Wallet</p>
                  <p className="text-xs text-text-secondary">Connected</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-text-secondary">Active</span>
              </div>
            </div>

            <div className="px-4 py-3">
              <p className="mb-1.5 text-xs text-text-secondary">Wallet Address</p>
              <div className="flex items-center gap-2">
                <code className="field-shell flex-1 truncate rounded-[0.875rem] px-2.5 py-1.5 text-xs font-mono text-text-main">
                  {user.walletAddress}
                </code>
                <button
                  type="button"
                  onClick={copyAddress}
                  title="Copy address"
                  className="focus-ring surface-card cursor-pointer rounded-[0.875rem] p-1.5 text-text-secondary transition-colors duration-150 hover:text-text-main"
                >
                  {copied ? (
                    <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border-main px-4 py-3">
              <p className="text-xs text-text-secondary">Balance</p>
              <p className="text-base font-bold text-text-main">
                {balance !== null ? `${balance} USDC` : '—'}
              </p>
            </div>

            <div className="border-t border-border-main px-4 py-2.5">
              <button
                type="button"
                onClick={() => { disconnect(); setBalance(null); setShowBalance(false); }}
                className="focus-ring flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[0.875rem] py-2 text-xs font-medium text-text-secondary transition-colors duration-150 hover:text-text-main"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Disconnect Wallet
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="focus-ring flex h-11 w-[11.5rem] items-center justify-center rounded-full border border-brand bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-brand-hover"
      >
        {mounted ? "Connect Wallet" : "Loading Wallet"}
      </button>

      {showDropdown && (
        <div className="glass-panel-strong absolute right-0 top-full z-50 mt-3 w-80 overflow-hidden rounded-[1rem]">
          <div className="flex items-center gap-3 border-b border-border-main px-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s-2-4-2-8c0-3.31 2.69-6 6-6s6 2.69 6 6c0 4-2 8-2 8z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-main">Connect to Locus</p>
              <p className="text-xs text-text-secondary">Pay for AI agents on Base</p>
            </div>
          </div>

          <div className="p-4">
            <button
              type="button"
              onClick={handleLocusConnect}
              disabled={loading}
              className="focus-ring mb-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Connect with Locus
                </>
              )}
            </button>

            <div className="mb-3 flex items-center gap-3">
              <div className="h-px flex-1 bg-border-main" />
              <span className="text-xs text-text-secondary">or enter address</span>
              <div className="h-px flex-1 bg-border-main" />
            </div>

            <div className="relative">
              <input
                type="text"
                value={walletInput}
                onChange={(e) => { setWalletInput(e.target.value); setError(null); }}
                placeholder="0x742d35Cc6634C0532925..."
                className={`field-shell focus-ring w-full rounded-xl px-3 py-2.5 pr-10 text-xs font-mono ${
                  error ? "border-red-400" : ""
                }`}
              />
              <svg className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {error && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleDemoConnect}
                className="focus-ring surface-card-soft flex-1 cursor-pointer rounded-xl px-3 py-2.5 text-xs font-medium text-text-secondary transition-colors duration-150 hover:text-text-main"
              >
                Demo Mode
              </button>
              <button
                type="button"
                onClick={handleManualConnect}
                disabled={!walletInput.trim()}
                className="focus-ring flex-1 cursor-pointer rounded-xl bg-brand px-3 py-2.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                Connect
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-border-main px-4 py-3 text-xs text-text-secondary">
            <svg className="h-3.5 w-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secured by Locus on Base
          </div>
        </div>
      )}
    </div>
  );
}
