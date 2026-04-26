"use client";

import { useState } from "react";
import { useAgentStore } from "@/store/agent";
import { Listing, getAgentById } from "@/data/store";

interface Props {
  onPurchase?: (result: PurchaseResult) => void;
}

interface PurchaseResult {
  success: boolean;
  buyerAgent: string;
  sellerAgent: string;
  listingTitle: string;
  amount: string;
  message: string;
}

export function AutonomousAgent({ onPurchase }: Props) {
  const { currentAgent, isAuthenticated } = useAgentStore();
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [results, setResults] = useState<PurchaseResult[]>([]);

  const addLog = (message: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const discoverAndBuy = async (budget: string, keywords: string[]) => {
    if (!currentAgent) {
      addLog("ERROR: No agent connected");
      return;
    }

    setLoading(true);
    addLog(`Agent ${currentAgent.name} starting discovery...`);
    addLog(`Budget: $${budget} USDC`);
    addLog(`Keywords: ${keywords.join(", ")}`);

    try {
      addLog("Fetching marketplace listings...");
      const res = await fetch("/api/marketplace/listings");
      const data = await res.json();
      const allListings = (data.listings || []) as Listing[];
      
      addLog(`Found ${allListings.length} total listings`);

      const matchingListings = allListings.filter(listing => {
        const matchesBudget = parseFloat(listing.priceUSDC) <= parseFloat(budget);
        const matchesKeywords = keywords.some(kw => 
          listing.title.toLowerCase().includes(kw.toLowerCase()) ||
          listing.description.toLowerCase().includes(kw.toLowerCase()) ||
          listing.category.toLowerCase().includes(kw.toLowerCase())
        );
        const isNotOwn = listing.agentId !== currentAgent.id;
        return matchesBudget && matchesKeywords && isNotOwn;
      });

      addLog(`Filtered to ${matchingListings.length} matching listings`);

      if (matchingListings.length === 0) {
        addLog("No matching listings found");
        setLoading(false);
        return;
      }

      matchingListings.sort((a, b) => parseFloat(a.priceUSDC) - parseFloat(b.priceUSDC));
      const selected = matchingListings[0];
      const seller = getAgentById(selected.agentId);
      
      addLog(`Selected: ${selected.title} by ${seller?.name || 'Unknown'}`);
      addLog(`Price: $${selected.priceUSDC} USDC`);
      addLog("Initiating autonomous purchase...");

      // Step 4: Autonomous purchase
      const purchaseRes = await fetch("/api/agents/autonomous-buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: selected.id,
          buyerAgentId: currentAgent.id,
        }),
      });

      const result = await purchaseRes.json();

      if (result.success) {
        addLog(`SUCCESS! ${result.message}`);
        setResults(prev => [result, ...prev]);
        onPurchase?.(result);
      } else {
        addLog(`FAILED: ${result.error || "Unknown error"}`);
      }

    } catch (err) {
      addLog(`ERROR: ${err instanceof Error ? err.message : "Failed"}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm text-yellow-700">
          Connect an agent to use autonomous purchasing
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border-main bg-surface p-4">
        <h3 className="font-semibold text-text-main">Autonomous Agent</h3>
        <p className="mt-1 text-sm text-text-secondary">
          Agent {currentAgent?.name} will automatically discover and purchase services
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-secondary">Max Budget (USDC)</label>
            <input
              type="number"
              id="budget"
              defaultValue="5"
              className="mt-1 w-full rounded-md border border-border-main bg-surface px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-text-secondary">Keywords</label>
            <input
              type="text"
              id="keywords"
              defaultValue="code,data,automation"
              className="mt-1 w-full rounded-md border border-border-main bg-surface px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          onClick={() => {
            const budget = (document.getElementById("budget") as HTMLInputElement).value;
            const keywords = (document.getElementById("keywords") as HTMLInputElement).value.split(",").map(k => k.trim());
            discoverAndBuy(budget, keywords);
          }}
          disabled={loading}
          className="mt-4 w-full rounded-md bg-brand py-2 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-40"
        >
          {loading ? "Agent is thinking..." : "Run Autonomous Agent"}
        </button>
      </div>

      {log.length > 0 && (
        <div className="rounded-lg border border-border-main bg-gray-900 p-4 font-mono text-sm">
          <p className="mb-2 font-semibold text-gray-400">Agent Log:</p>
          {log.map((entry, i) => (
            <p key={i} className="text-green-400">{entry}</p>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="font-semibold text-green-700">Purchase Results:</p>
          {results.map((r, i) => (
            <p key={i} className="mt-1 text-sm text-green-600">{r.message}</p>
          ))}
        </div>
      )}
    </div>
  );
}