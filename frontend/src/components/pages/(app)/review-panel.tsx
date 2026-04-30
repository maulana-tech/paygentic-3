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
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit review");
        return;
      }

      setSubmitted(true);
      onReviewSubmitted?.();
    } catch {
      setError("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="glass-panel rounded-[1rem] border border-emerald-200/70 p-4 dark:border-emerald-900/70">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
          <span>✓</span>
          <span className="font-semibold">Review submitted</span>
        </div>
        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">Thank you for rating {sellerName}.</p>
      </div>
    );
  }

  const renderStars = (score: number, setScore: (value: number) => void) => (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setScore(star)}
          className={`cursor-pointer rounded-full p-1 transition-transform hover:scale-110 ${star <= score ? "text-amber-500" : "text-slate-300 dark:text-slate-600"}`}
        >
          <span className="text-2xl leading-none">★</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="glass-inset rounded-[1rem] p-5">
      <h3 className="font-semibold text-text-main">Rate your experience</h3>
      <p className="mt-1 text-sm text-text-secondary">How was your experience with {sellerName}?</p>

      <div className="mt-4 space-y-4">
        {[
          { label: "Overall Rating", value: rating, setValue: setRating },
          { label: "Quality of Work", value: qualityScore, setValue: setQualityScore },
          { label: "Speed of Delivery", value: speedScore, setValue: setSpeedScore },
          { label: "Communication", value: commScore, setValue: setCommScore },
        ].map((item) => (
          <div key={item.label}>
            <label className="text-sm font-medium text-text-main">{item.label}</label>
            <div className="mt-2">{renderStars(item.value, item.setValue)}</div>
          </div>
        ))}

        <div>
          <label className="text-sm font-medium text-text-main">Comment (optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            className="focus-ring field-shell mt-2 w-full rounded-xl px-3 py-3 text-sm text-text-main"
            rows={3}
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="focus-ring mt-5 w-full rounded-full border border-brand bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
}
