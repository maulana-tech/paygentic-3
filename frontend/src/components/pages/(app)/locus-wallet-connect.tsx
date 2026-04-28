"use client";

import { useState } from "react";
import { useUserStore } from "@/store/user";
import { User, addActivityLog } from "@/data/store";

interface Props {
  onConnect?: (user: User) => void;
}

export function LocusWalletConnect({ onConnect }: Props) {
  const { user, setUser, isConnected, disconnect } = useUserStore();
  const [showInput, setShowInput] = useState(false);
  const [walletInput, setWalletInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const connectLocusWallet = async () => {
    // Directly show demo input for now
    // Real Locus Wallet SDK integration would go here
    setShowInput(true);
  };

  const handleDemoConnect = () => {
    if (!walletInput.trim()) {
      setError("Please enter a wallet address");
      return;
    }

    // Locus wallets on Base start with 0x and are 42 chars
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletInput.trim())) {
      setError("Invalid Locus wallet address (Base network)");
      return;
    }

    const newUser: User = {
      id: `user_${crypto.randomUUID().slice(0, 8)}`,
      walletAddress: walletInput.trim().toLowerCase(),
      createdAt: new Date().toISOString()
    };

    setUser(newUser);
    addActivityLog(newUser.id, 'INFO', 'Connected Locus Smart Wallet (Demo)', { 
      address: newUser.walletAddress.slice(0, 10) + '...',
      network: 'Base (Demo)'
    });
    onConnect?.(newUser);
    setShowInput(false);
    setWalletInput("");
    setError(null);
  };

  if (isConnected && user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-none bg-brand text-sm font-semibold text-white">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="hidden text-sm md:block">
            <p className="font-medium text-text-main">Locus Wallet</p>
            <p className="text-xs text-text-secondary font-mono">
              {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-none bg-green-100 px-2 py-1">
          <span className="h-2 w-2 rounded-none bg-green-500"></span>
          <span className="text-xs font-medium text-green-700">Base</span>
        </div>
        <button
          onClick={() => {
            if (user) {
              addActivityLog(user.id, 'INFO', 'Disconnected Locus Wallet');
            }
            disconnect();
          }}
          className="rounded-none px-3 py-1.5 text-sm text-text-secondary hover:bg-gray-100"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={connectLocusWallet}
        className="flex items-center gap-2 rounded-none border border-border-main bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-brand"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Connect Locus Wallet</span>
      </button>

      {showInput && (
        <div className="absolute right-0 z-50 mt-2 w-96 rounded-none border border-border-main bg-surface p-5 shadow-lg">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-none bg-brand">
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-text-main">Locus Smart Wallet</p>
              <p className="text-xs text-text-secondary">Demo Mode - Base Network</p>
            </div>
          </div>
          
          <p className="mb-3 text-sm text-text-secondary">
            Enter your Locus wallet address to continue in demo mode:
          </p>
          <input
            type="text"
            value={walletInput}
            onChange={(e) => setWalletInput(e.target.value)}
            placeholder="0x..."
            className="w-full rounded-none border border-border-main bg-white px-3 py-2.5 text-sm font-mono"
          />
          {error && (
            <p className="mt-2 text-xs text-red-500">{error}</p>
          )}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                setShowInput(false);
                setError(null);
              }}
              className="flex-1 rounded-none border border-border-main px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDemoConnect}
              className="flex-1 rounded-none bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
            >
              Connect Wallet
            </button>
          </div>
          <div className="mt-4 rounded-none bg-yellow-50 p-3">
            <p className="text-xs text-yellow-700">
              <strong>Demo Mode:</strong> Enter any valid Base wallet address to test the marketplace. 
              Locus Wallet SDK integration coming soon.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}