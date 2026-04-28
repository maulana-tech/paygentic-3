"use client";

import { useState } from "react";

interface ReviewPanelProps {
  sellerAgentId: string;
  sellerName: string;
  listingId?: string;
  onReviewSubmitted?: () => void;
}

export function ReviewPanel({ sellerAgentId, sellerName, listingId, onReviewSubmitted }: ReviewPanelProps) {
  const [rating, setRating] = useState(5);
  const [qualityScore, setQualityScore] = useState(5);
  const [speedScore, setSpeedScore] = useState(5);
  const [commScore, setCommScore] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaseId: "demo-purchase",
          listingId: listingId || "unknown",
          sellerAgentId,
          buyerUserId: "demo-user",
          rating,
          qualityScore,
          speedScore,
          commScore,
          comment
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to submit review");
        return;
      }
      
      setSubmitted(true);
      onReviewSubmitted?.();
    } catch (err) {
      setError("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mt-4 rounded-none border border-green-300 bg-green-50 p-4">
        <div className="flex items-center gap-2 text-green-700">
          <span>✓</span>
          <span className="font-semibold">Review submitted!</span>
        </div>
        <p className="mt-1 text-sm text-green-600">
          Thank you for rating {sellerName}.
        </p>
      </div>
    );
  }

  const renderStars = (score: number, setScore: (v: number) => void) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setScore(star)}
          className={`text-xl ${star <= score ? "text-yellow-400" : "text-gray-300"}`}
        >
          ★
        </button>
      ))}
    </div>
  );

  return (
    <div className="mt-4 rounded-none border border-border-main bg-gray-50 p-4">
      <h3 className="font-semibold text-text-main">Rate Your Experience</h3>
      <p className="mt-1 text-xs text-text-secondary">
        How was your experience with {sellerName}?
      </p>
      
      <div className="mt-4 space-y-4">
        <div>
          <label className="text-sm text-text-secondary">Overall Rating</label>
          <div className="mt-1">{renderStars(rating, setRating)}</div>
        </div>
        
        <div>
          <label className="text-sm text-text-secondary">Quality of Work</label>
          <div className="mt-1">{renderStars(qualityScore, setQualityScore)}</div>
        </div>
        
        <div>
          <label className="text-sm text-text-secondary">Speed of Delivery</label>
          <div className="mt-1">{renderStars(speedScore, setSpeedScore)}</div>
        </div>
        
        <div>
          <label className="text-sm text-text-secondary">Communication</label>
          <div className="mt-1">{renderStars(commScore, setCommScore)}</div>
        </div>
        
        <div>
          <label className="text-sm text-text-secondary">Comment (optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            className="mt-1 w-full rounded-none border border-border-main bg-white px-3 py-2 text-sm outline-none"
            rows={3}
          />
        </div>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-4 w-full rounded-none bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
}