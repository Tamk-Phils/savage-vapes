'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  color?: string;
}

export default function LoadingSpinner({
  size = 'md',
  text,
  className = '',
  color = '#0d9488',
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: { container: 'w-5 h-5', stroke: 2.5, radius: 8, centerDot: 'w-1 h-1' },
    md: { container: 'w-9 h-9', stroke: 3, radius: 14, centerDot: 'w-2 h-2' },
    lg: { container: 'w-14 h-14', stroke: 3.5, radius: 22, centerDot: 'w-3 h-3' },
    xl: { container: 'w-20 h-20', stroke: 4, radius: 32, centerDot: 'w-4 h-4' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={`relative ${currentSize.container} flex items-center justify-center`}>
        {/* Outer subtle glow ring */}
        <div 
          className="absolute inset-0 rounded-full blur-xs opacity-40 animate-pulse"
          style={{ backgroundColor: color }}
        />

        {/* Dual-ring SVG Orbital Spinner */}
        <svg
          className="w-full h-full animate-spin"
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle background track */}
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="currentColor"
            strokeWidth={currentSize.stroke}
            className="text-slate-200"
            opacity="0.6"
          />
          {/* High-speed primary gradient arc */}
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="url(#spinner-gradient)"
            strokeWidth={currentSize.stroke + 0.5}
            strokeLinecap="round"
            strokeDasharray="90 150"
            strokeDashoffset="0"
          />
          <defs>
            <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#45cab4" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
          </defs>
        </svg>

        {/* Pulsing inner brand core dot */}
        <div
          className={`absolute rounded-full animate-ping opacity-75 ${currentSize.centerDot}`}
          style={{ backgroundColor: color }}
        />
        <div
          className={`absolute rounded-full ${currentSize.centerDot}`}
          style={{ backgroundColor: color }}
        />
      </div>

      {text && (
        <span className="text-xs font-semibold text-slate-500 tracking-wide animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
}

// Inline button spinner for instant actions
export function InlineSpinner({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// Card / Section Loader
export function CardLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="w-full py-14 flex items-center justify-center">
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}

// Fullscreen Loader for major transitions
export function FullScreenLoader({ text = 'Please wait...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xl flex flex-col items-center">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
}

