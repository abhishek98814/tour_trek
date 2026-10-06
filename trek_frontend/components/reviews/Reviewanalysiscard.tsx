'use client';

import { useEffect, useState } from 'react';
import { getReviewAnalysis } from '@/lib/review';
import { ReviewAnalysis } from '@/types/review';

interface Props {
  reviewType: 'trek' | 'tour' | 'gear' | 'guide';
  objectId: number;
}

const sentimentColor: Record<string, string> = {
  positive: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  mixed: 'text-amber-700 bg-amber-50 border-amber-200',
  negative: 'text-red-700 bg-red-50 border-red-200',
};

export default function ReviewAnalysisCard({ reviewType, objectId }: Props) {
  const [analysis, setAnalysis] = useState<ReviewAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getReviewAnalysis(reviewType, objectId)
      .then((data) => {
        if (!cancelled) setAnalysis(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load review insights.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reviewType, objectId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-teal-100 bg-white p-6 animate-pulse">
        <div className="h-4 w-1/3 bg-teal-50 rounded mb-3" />
        <div className="h-3 w-full bg-teal-50 rounded mb-2" />
        <div className="h-3 w-5/6 bg-teal-50 rounded" />
      </div>
    );
  }

  if (error || !analysis) {
    return null; // fail quietly — this is a nice-to-have, not core content
  }

  if (analysis.review_count_at_analysis === 0) {
    return null; // no reviews yet, nothing to show
  }

  return (
    <div className="rounded-xl border border-teal-100 bg-white p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-navy-900">What travelers are saying</h3>
        {analysis.sentiment && (
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
              sentimentColor[analysis.sentiment] ?? ''
            }`}
          >
            {analysis.sentiment}
          </span>
        )}
      </div>

      <p className="text-sm text-gray-700 leading-relaxed">{analysis.summary}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {analysis.pros.length > 0 && (
          <div>
            <p className="text-xs font-medium text-teal-700 mb-1.5">Loved by travelers</p>
            <ul className="space-y-1">
              {analysis.pros.map((p, i) => (
                <li key={i} className="text-sm text-gray-600 flex gap-1.5">
                  <span className="text-teal-600">+</span> {p}
                </li>
              ))}
            </ul>
          </div>
        )}
        {analysis.cons.length > 0 && (
          <div>
            <p className="text-xs font-medium text-amber-700 mb-1.5">Worth knowing</p>
            <ul className="space-y-1">
              {analysis.cons.map((c, i) => (
                <li key={i} className="text-sm text-gray-600 flex gap-1.5">
                  <span className="text-amber-600">−</span> {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {analysis.recommendation && (
        <p className="text-sm italic text-navy-800 border-t border-teal-50 pt-3">
          {analysis.recommendation}
        </p>
      )}

      <p className="text-xs text-gray-400">
        AI summary of {analysis.review_count_at_analysis} reviews
        {analysis.average_rating_at_analysis
          ? ` · ${analysis.average_rating_at_analysis.toFixed(1)}★ avg`
          : ''}
      </p>
    </div>
  );
}