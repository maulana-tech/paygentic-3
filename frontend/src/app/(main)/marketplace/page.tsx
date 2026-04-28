"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Header, HeroBanner } from "@/components/pages/(app)";
import { useUserStore } from "@/store/user";
import { CATEGORIES } from "@/data/store";

interface Listing {
  id: string;
  sellerAgentId: string;
  sellerName: string;
  sellerWallet: string;
  title: string;
  description: string;
  category: string;
  priceUSDC: string;
  active: boolean;
  totalSales: number;
  createdAt?: string;
}

const ITEMS_PER_PAGE = 9;

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const { user, isConnected } = useUserStore();

  useEffect(() => {
    fetch("/api/marketplace/listings")
      .then((res) => res.json())
      .then((data) => setListings(data.listings || []))
      .finally(() => setLoading(false));
  }, []);

  const filteredListings = useMemo(() => {
    let result = [...listings];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(searchLower) ||
          l.description.toLowerCase().includes(searchLower) ||
          l.category.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (category) {
      result = result.filter((l) => l.category === category);
    }

    // Price range filter
    if (priceRange) {
      result = result.filter((l) => {
        const price = parseFloat(l.priceUSDC);
        if (priceRange === "0-0.1") return price <= 0.1;
        if (priceRange === "0.1-0.25") return price > 0.1 && price <= 0.25;
        if (priceRange === "0.25-0.5") return price > 0.25 && price <= 0.5;
        if (priceRange === "0.5+") return price > 0.5;
        return true;
      });
    }

    // Sort
    if (sortBy === "price-low") {
      result.sort((a, b) => parseFloat(a.priceUSDC) - parseFloat(b.priceUSDC));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => parseFloat(b.priceUSDC) - parseFloat(a.priceUSDC));
    } else if (sortBy === "popular") {
      result.sort((a, b) => b.totalSales - a.totalSales);
    } else if (sortBy === "newest") {
      result.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    }

    return result;
  }, [listings, search, category, priceRange, sortBy]);

  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setPriceRange("");
    setSortBy("popular");
    setCurrentPage(1);
  };

  const hasFilters = search || category || priceRange;

  return (
    <div className="min-h-screen bg-main-bg">
      <Header />
      <main className="mx-auto max-w-6xl px-8 pb-16 pt-6">
        <HeroBanner />
        
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text-main">Available Services</h2>
              <p className="mt-1 text-sm text-text-secondary">
                {filteredListings.length} services found
              </p>
            </div>
            {isConnected && user && (
              <div className="rounded-lg bg-green-50 px-3 py-2 text-sm">
                <span className="text-green-700">Connected: </span>
                <span className="font-semibold text-green-800">{user.walletAddress.slice(0, 8)}...</span>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search services..."
              className="w-full rounded-none border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Category */}
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}
            className="rounded-none border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Price Range */}
          <select
            value={priceRange}
            onChange={(e) => { setPriceRange(e.target.value); setCurrentPage(1); }}
            className="rounded-none border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All Prices</option>
            <option value="0-0.1">Under $0.10</option>
            <option value="0.1-0.25">$0.10 - $0.25</option>
            <option value="0.25-0.5">$0.25 - $0.50</option>
            <option value="0.5+">Over $0.50</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-none border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="mt-8 flex items-center justify-center py-20">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-none bg-blue-600" />
              <div className="h-2 w-2 animate-pulse rounded-none bg-blue-600 [animation-delay:150ms]" />
              <div className="h-2 w-2 animate-pulse rounded-none bg-blue-600 [animation-delay:300ms]" />
            </div>
          </div>
        ) : paginatedListings.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-gray-500">No services found</p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {paginatedListings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/marketplace/listing/${listing.id}`}
                  className="group block cursor-pointer rounded-none border border-gray-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="inline-block rounded-none bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                        {listing.category}
                      </span>
                      <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                        {listing.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                        {listing.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">{listing.sellerName}</span>
                        {listing.totalSales > 0 && (
                          <span className="flex items-center gap-1 text-xs text-yellow-600">
                            <span>★</span>
                            <span>{listing.totalSales}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-none bg-blue-600 px-3 py-1.5 text-sm font-bold text-white">
                      ${listing.priceUSDC}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="rounded-none border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-none border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}