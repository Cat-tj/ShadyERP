"use client";

import { useId } from "react";

/** Logomark "a" gradient Altora — dipakai di login/register dan tempat lain di luar landing page. */
export function AltoraLogomark({ className = "h-10 w-10" }: { className?: string }) {
  const uid = useId();
  const gradientId = `altora-logo-grad-${uid}`;
  const shadeId = `altora-logo-shade-${uid}`;

  return (
    <svg viewBox="0 0 400 460" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#2f3ba3" />
          <stop offset="22%" stopColor="#6a3cc0" />
          <stop offset="42%" stopColor="#a730a8" />
          <stop offset="60%" stopColor="#d94a86" />
          <stop offset="78%" stopColor="#f28a4e" />
          <stop offset="100%" stopColor="#f6c945" />
        </linearGradient>
        <linearGradient id={shadeId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M 210 40 C 150 40 100 75 70 130 L 130 175 C 150 140 175 118 210 118 C 245 118 268 138 268 168 L 268 195 L 175 195 C 105 195 55 235 55 300 C 55 365 110 405 175 405 C 215 405 245 388 268 360 L 268 395 L 335 395 L 335 168 C 335 90 290 40 210 40 Z M 268 250 L 268 300 C 268 335 235 350 195 350 C 160 350 130 335 130 305 C 130 270 165 250 205 250 Z"
        fill={`url(#${gradientId})`}
        fillRule="evenodd"
      />
      <path
        d="M 268 195 L 175 195 C 105 195 55 235 55 300 C 55 320 60 337 70 352 C 75 300 120 262 180 262 L 268 262 Z"
        fill={`url(#${shadeId})`}
      />
      <path
        d="M 335 300 C 335 350 315 390 275 408 C 305 400 335 375 335 335 Z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}
