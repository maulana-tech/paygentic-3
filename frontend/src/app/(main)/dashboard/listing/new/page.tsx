"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/pages/(app)";
import { useUserStore } from "@/store/user";
import { CATEGORIES, listings, addActivityLog } from "@/data/store";

export default function NewListingPage() {
  const router = useRouter();
  const { user, isConnected } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'code generation',
    priceUSDC: ''
  });

  if (!isConnected || !user) {
    return (
      <div className="min-h-screen bg-main-bg">
        <Header />
        <main className="mx-auto max-w-2xl px-8 pb-16 pt-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-main">Connect Wallet First</h1>
            <p className="mt-2 text-text-secondary">
              You need to connect your Locus Wallet to create listings
            </p>
            <Link href="/" className="mt-4 inline-block text-brand hover:underline">
              Go to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.title.trim() || !formData.description.trim() || !formData.priceUSDC) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const price = parseFloat(formData.priceUSDC);
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price');
      setLoading(false);
      return;
    }

    // Create listing
    const newListing = {
      id: `svc_${crypto.randomUUID().slice(0, 8)}`,
      userId: user.id,
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      priceUSDC: formData.priceUSDC,
      active: true,
      totalSales: 0,
      createdAt: new Date().toISOString()
    };

    listings.push(newListing as any);
    
    addActivityLog(user.id, 'LISTING_CREATED', `Created listing: ${newListing.title}`, {
      price: `$${newListing.priceUSDC}`,
      category: newListing.category
    });

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-main-bg">
      <Header />
      <main className="mx-auto max-w-2xl px-8 pb-16 pt-6">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-text-secondary hover:text-brand">
          <span>←</span>
          <span>Back to Dashboard</span>
        </Link>

        <div className="rounded-none border border-border-main bg-surface p-6">
          <h1 className="text-xl font-bold text-text-main">Create New Listing</h1>
          <p className="mt-1 text-sm text-text-secondary">List your AI agent service on the marketplace</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-main">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Python Script Generation"
                className="mt-1 w-full rounded-none border border-border-main bg-white px-4 py-2.5 text-text-main outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what your service does..."
                rows={4}
                className="mt-1 w-full rounded-none border border-border-main bg-white px-4 py-2.5 text-text-main outline-none focus:border-brand"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-main">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 w-full rounded-none border border-border-main bg-white px-4 py-2.5 text-text-main outline-none focus:border-brand"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main">Price (Locus Credits)</label>
                <div className="mt-1 flex items-center rounded-none border border-border-main bg-white px-4 py-2.5">
                  <span className="text-text-secondary">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.priceUSDC}
                    onChange={(e) => setFormData({ ...formData, priceUSDC: e.target.value })}
                    placeholder="0.00"
                    className="ml-2 w-full outline-none"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="flex gap-3 pt-4">
              <Link
                href="/dashboard"
                className="flex-1 rounded-none border border-border-main bg-white px-4 py-2.5 text-center text-sm font-medium text-text-main hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-none bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Listing'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}