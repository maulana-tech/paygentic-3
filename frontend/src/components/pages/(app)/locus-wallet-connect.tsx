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
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-none bg-gray-100 px-3 py-1.5">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-mono text-gray-700">
            {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
          </span>
          {balance !== null && (
            <span className="text-xs font-semibold text-green-700">
              {balance} USDC
            </span>
          )}
        </div>
        <button
          onClick={() => { disconnect(); setBalance(null); }}
          className="cursor-pointer rounded-none text-sm text-gray-500 hover:text-gray-700"
        >
          Disconnect
        </button>
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
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-none border border-gray-200 bg-white p-4 shadow-xl">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-none bg-blue-600">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Locus Wallet</p>
              <p className="text-xs text-gray-500">Powered by Locus on Base</p>
            </div>
          </div>

          <button
            onClick={handleLocusConnect}
            disabled={loading}
            className="mb-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-none bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {loading ? 'Connecting...' : 'Connect with Locus'}
          </button>

          <div className="mb-3 flex items-center gap-2">
            <div className="h-px flex-1 bg-gray-200"></div>
            <span className="text-xs text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          <p className="mb-2 text-xs text-gray-500">Enter wallet address:</p>
          <input
            type="text"
            value={walletInput}
            onChange={(e) => setWalletInput(e.target.value)}
            placeholder="0x..."
            className="w-full rounded-none border border-gray-300 bg-white px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none"
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

          <div className="mt-3 flex gap-2">
            <button
              onClick={handleDemoConnect}
              className="flex-1 cursor-pointer rounded-none border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Demo
            </button>
            <button
              onClick={handleManualConnect}
              className="flex-1 cursor-pointer rounded-none bg-gray-800 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-900"
            >
              Connect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
