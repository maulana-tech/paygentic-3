"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header, GlassSelect } from "@/components/pages/(app)";
import { useUserStore } from "@/store/user";
import { CATEGORIES, addActivityLog, listings } from "@/data/store";

export default function NewListingPage() {
  const router = useRouter();
  const { user, isConnected } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "code generation",
    priceUSDC: "",
  });

  const inputClass =
    "focus-ring mt-2 w-full rounded-2xl border border-border-main bg-white/80 px-4 py-3 text-sm text-text-main placeholder:text-text-secondary";

  if (!isConnected || !user) {
    return (
      <div className="dashboard-shell min-h-screen bg-main-bg">
        <Header />
        <main className="relative mx-auto max-w-4xl px-6 pb-16 pt-12 sm:px-8">
          <div className="glass-panel-strong rounded-[2rem] p-8 text-center sm:p-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-brand-light ring-1 ring-blue-100">
              <svg
                className="h-10 w-10 text-brand"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">
              Listing access
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-main">
              Connect wallet first
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-text-secondary">
              You need to connect your Locus Wallet before publishing a new
              service listing.
            </p>
            <Link
              href="/"
              className="focus-ring mt-8 inline-flex rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-sm font-medium text-text-main hover:bg-white"
            >
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

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.priceUSDC
    ) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    const price = parseFloat(formData.priceUSDC);
    if (isNaN(price) || price <= 0) {
      setError("Please enter a valid price");
      setLoading(false);
      return;
    }

    const newListing = {
      id: `svc_${crypto.randomUUID().slice(0, 8)}`,
      userId: user.id,
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      priceUSDC: formData.priceUSDC,
      active: true,
      totalSales: 0,
      createdAt: new Date().toISOString(),
    };

    listings.push(newListing as never);

    addActivityLog(
      user.id,
      "LISTING_CREATED",
      `Created listing: ${newListing.title}`,
      {
        price: `$${newListing.priceUSDC}`,
        category: newListing.category,
      },
    );

    router.push("/dashboard");
  };

  return (
    <div className="dashboard-shell min-h-screen bg-main-bg">
      <Header />
      <main className="relative mx-auto max-w-6xl px-6 pb-16 pt-6 sm:px-8">
        <Link
          href="/dashboard"
          className="focus-ring mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm text-text-muted hover:bg-white"
        >
          <span>←</span>
          <span>Back to Dashboard</span>
        </Link>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <section className="glass-panel-strong rounded-[2rem] p-6 sm:p-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">
                Seller workflow
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-main">
                Create a listing that reads clearly and sells confidently.
              </h1>
              <p className="mt-4 text-base leading-7 text-text-secondary">
                Publish a focused service offer with a clear title, scoped
                description, and a price that clients can evaluate quickly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="glass-inset rounded-[1.5rem] p-5">
                <label
                  htmlFor="listing-title"
                  className="block text-sm font-medium text-text-main"
                >
                  Title
                </label>
                <p className="mt-1 text-sm text-text-secondary">
                  Keep it specific and outcome-focused.
                </p>
                <input
                  id="listing-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Python script generation for internal tools"
                  className={inputClass}
                />
              </div>

              <div className="glass-inset rounded-[1.5rem] p-5">
                <label
                  htmlFor="listing-description"
                  className="block text-sm font-medium text-text-main"
                >
                  Description
                </label>
                <p className="mt-1 text-sm text-text-secondary">
                  Describe the scope, deliverable, and expected result.
                </p>
                <textarea
                  id="listing-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe what your service does, what the buyer gets, and where it performs best."
                  rows={5}
                  className={`${inputClass} resize-y`}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="glass-inset rounded-[1.5rem] p-5">
                  <label
                    htmlFor="listing-category"
                    className="block text-sm font-medium text-text-main"
                  >
                    Category
                  </label>
                  <p className="mt-1 text-sm text-text-secondary">
                    Choose the closest fit for discovery and filtering.
                  </p>
                  <div className="mt-2">
                    <GlassSelect
                      value={formData.category}
                      onChange={(val) =>
                        setFormData({ ...formData, category: val })
                      }
                      options={CATEGORIES.map((category) => ({
                        value: category,
                        label: category,
                      }))}
                    />
                  </div>
                </div>

                <div className="glass-inset rounded-[1.5rem] p-5">
                  <label
                    htmlFor="listing-price"
                    className="block text-sm font-medium text-text-main"
                  >
                    Price
                  </label>
                  <p className="mt-1 text-sm text-text-secondary">
                    Set a single upfront amount in Locus Credits.
                  </p>
                  <div className="focus-ring mt-2 flex items-center rounded-2xl border border-border-main bg-white/80 px-4 py-3">
                    <span className="text-text-secondary">$</span>
                    <input
                      id="listing-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.priceUSDC}
                      onChange={(e) =>
                        setFormData({ ...formData, priceUSDC: e.target.value })
                      }
                      placeholder="0.00"
                      className="ml-2 w-full border-0 bg-transparent text-sm text-text-main outline-none"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div
                  className="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="focus-ring flex-1 rounded-full border border-slate-200 bg-white/80 px-4 py-3 text-center text-sm font-medium text-text-main hover:bg-white"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="focus-ring flex-1 rounded-full border border-brand bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
                >
                  {loading ? "Creating..." : "Create Listing"}
                </button>
              </div>
            </form>
          </section>

          <aside className="glass-panel rounded-[2rem] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">
              Checklist
            </p>
            <h2 className="mt-2 text-lg font-semibold text-text-main">
              Before you publish
            </h2>
            <div className="mt-5 space-y-3">
              {[
                "Use a title that names the exact service.",
                "Describe the output, not just the capability.",
                "Choose the category buyers will actually browse.",
                "Set a price that matches the scope and effort.",
              ].map((item) => (
                <div
                  key={item}
                  className="glass-inset flex items-start gap-3 rounded-[1.25rem] p-4"
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-semibold text-brand">
                    ✓
                  </div>
                  <p className="text-sm leading-6 text-text-muted">{item}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
