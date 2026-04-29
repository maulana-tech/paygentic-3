"use client";

import { useState, useRef, useEffect } from "react";
import { useUserStore } from "@/store/user";
import { User, addActivityLog } from "@/data/store";

const LOCUS_WALLET_URL = process.env.NEXT_PUBLIC_LOCUS_WALLET_URL || 'https://beta-pay.paywithlocus.com';

export function LocusWalletConnect() {
  const { user, setUser, isConnected, disconnect } = useUserStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [walletInput, setWalletInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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

  if (isConnected && user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="flex cursor-pointer items-center gap-2 rounded-none border border-border-main bg-white px-3 py-1.5 transition-colors hover:bg-gray-50"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
            <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-text-main leading-none">
              {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
            </p>
            {balance !== null && (
              <p className="mt-0.5 text-xs text-green-600 leading-none">
                {balance} USDC
              </p>
            )}
          </div>
          <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showBalance && (
          <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-none border border-border-main bg-white shadow-xl">
            <div className="border-b border-border-main px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-none bg-blue-600">
                    <span className="text-xs font-bold text-white">L</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-main">Locus Wallet</p>
                    <p className="text-xs text-text-secondary">Connected</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                  <span className="text-xs text-green-600">Active</span>
                </div>
              </div>
            </div>

            <div className="px-4 py-3">
              <p className="text-xs text-text-secondary">Wallet Address</p>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 truncate rounded-none bg-gray-50 px-2.5 py-1.5 text-xs font-mono text-text-main">
                  {user.walletAddress}
                </code>
                <button
                  onClick={copyAddress}
                  className="cursor-pointer rounded-none border border-border-main p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                  title="Copy address"
                >
                  {copied ? (
                    <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

            <div className="border-t border-border-main px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-text-secondary">Balance</p>
                <p className="text-base font-bold text-text-main">
                  {balance !== null ? `${balance} USDC` : '---'}
                </p>
              </div>
            </div>

            <div className="border-t border-border-main px-4 py-2">
              <button
                onClick={() => { disconnect(); setBalance(null); setShowBalance(false); }}
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
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
        onClick={() => setShowDropdown(!showDropdown)}
        className="cursor-pointer rounded-none bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Connect Wallet
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-none border border-border-main bg-white shadow-xl">
          <div className="border-b border-border-main p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-none bg-blue-600">
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
          </div>

          <div className="p-4">
            <button
              onClick={handleLocusConnect}
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-none bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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

            <div className="my-3 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200"></div>
              <span className="text-xs text-text-secondary">or enter address</span>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>

            <div className="relative">
              <input
                type="text"
                value={walletInput}
                onChange={(e) => { setWalletInput(e.target.value); setError(null); }}
                placeholder="0x742d35Cc6634C0532925..."
                className={`w-full rounded-none border bg-gray-50 px-3 py-2.5 pr-10 text-xs font-mono focus:border-blue-500 focus:bg-white focus:outline-none ${
                  error ? 'border-red-300' : 'border-border-main'
                }`}
              />
              <svg className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {error && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}

            <div className="mt-3 flex gap-2">
              <button
                onClick={handleDemoConnect}
                className="flex-1 cursor-pointer rounded-none border border-border-main px-3 py-2 text-xs font-medium text-text-secondary hover:bg-gray-50"
              >
                Demo Mode
              </button>
              <button
                onClick={handleManualConnect}
                disabled={!walletInput.trim()}
                className="flex-1 cursor-pointer rounded-none bg-gray-800 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Connect
              </button>
            </div>
          </div>

          <div className="border-t border-border-main px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <svg className="h-3.5 w-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secured by Locus on Base
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
