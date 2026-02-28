"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill={filled ? "#f59e0b" : "none"}
      stroke={filled ? "#f59e0b" : "#d1d5db"}
      strokeWidth="1.5"
      className="transition-colors"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default function StarRating({ value, onChange, label }: StarRatingProps) {
  const [hover, setHover] = useState(0);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="p-1 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            aria-label={`Rate ${star} out of 5 stars`}
          >
            <StarIcon filled={star <= (hover || value)} />
          </button>
        ))}
      </div>
    </div>
  );
}
