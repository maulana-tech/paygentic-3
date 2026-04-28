"use client";

import { useState, useRef, useEffect } from "react";
import { useUserStore } from "@/store/user";
import { User, addActivityLog } from "@/data/store";

const DEMO_WALLET = "0x742d35Cc6634C0532925aDbp3049gD5EWt250N2Oa";

export function LocusWalletConnect() {
  const { user, setUser, isConnected, disconnect } = useUserStore();
  const [showDropdown, setShowDropdown] = useState(false);
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

  const handleConnect = () => {
    const addr = walletInput.trim() || DEMO_WALLET;
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      setError("Invalid wallet address");
      return;
    }

    const newUser: User = {
      id: `user_${crypto.randomUUID().slice(0, 8)}`,
      walletAddress: addr.toLowerCase(),
      createdAt: new Date().toISOString()
    };

    setUser(newUser);
    addActivityLog(newUser.id, 'INFO', 'Connected Locus Wallet');
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
        </div>
        <button
          onClick={() => disconnect()}
          className="rounded-none text-sm text-gray-500 hover:text-gray-700"
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
        className="rounded-none bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Connect Wallet
      </button>
 
      {showDropdown && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-none border border-gray-200 bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-none bg-blue-600">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Locus Wallet</p>
              <p className="text-xs text-gray-500">Connecting to Base</p>
            </div>
          </div>
          
          <p className="mb-2 text-xs text-gray-600">
            Enter your wallet address or use demo:
          </p>
          <input
            type="text"
            value={walletInput}
            onChange={(e) => setWalletInput(e.target.value)}
            placeholder={DEMO_WALLET}
            className="w-full rounded-none border border-gray-300 bg-white px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none"
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setShowDropdown(false)}
              className="flex-1 rounded-none border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConnect}
              className="flex-1 rounded-none bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Connect
            </button>
          </div>
          
          <p className="mt-3 rounded-none bg-yellow-50 p-2 text-xs text-yellow-800">
            Demo: Use the pre-filled address to test the marketplace.
          </p>
        </div>
      )}
    </div>
  );
}