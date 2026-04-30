"use client";

import { useState } from "react";
import { StickyBanner } from "@/components/ui/sticky-banner";
import { useUserStore } from "@/store/user";

export function PromoBanner() {
  const { user, isConnected } = useUserStore();
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleClaim = async () => {
    if (!isConnected || !user || claimed || loading) return;
    setLoading(true);

    window.open("https://instagram.com/paywithlocus", "_blank");

    const res = await fetch("/api/service-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    const data = await res.json();
    if (data.granted > 0) {
      setClaimed(true);
    }
    setLoading(false);
  };

  return (
    <StickyBanner className="bg-gradient-to-b from-blue-500 to-blue-600" hideOnScroll hideClose>
      <p className="mx-0 max-w-[90%] text-white drop-shadow-md">
        {!claimed ? (
          <>
            Follow{" "}
            <a
              href="https://instagram.com/paywithlocus"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline transition duration-200"
            >
              @paywithlocus
            </a>{" "}
            on Instagram &amp; get 3 free AI agents.{" "}
            {isConnected ? (
              <button
                type="button"
                onClick={handleClaim}
                disabled={loading}
                className="ml-1 cursor-pointer rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold backdrop-blur-sm transition hover:bg-white/30 disabled:opacity-50"
              >
                {loading ? "Claiming..." : "Claim Now"}
              </button>
            ) : (
              <span className="text-blue-100">Connect wallet first to claim.</span>
            )}
          </>
        ) : (
          <>
            Agents claimed! Go to{" "}
            <a href="/agents" className="font-semibold underline transition duration-200 hover:text-blue-200">
              My Agents
            </a>{" "}
            to start using them.
          </>
        )}
      </p>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-white/70 transition hover:text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M18 6l-12 12" />
          <path d="M6 6l12 12" />
        </svg>
      </button>
    </StickyBanner>
  );
}
