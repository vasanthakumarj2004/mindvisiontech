"use client";

import type { CSSProperties } from "react";

export type TickerBarProps = {
  items: string[];
  speed?: number;
};

type TickerStyle = CSSProperties & {
  "--ticker-duration": string;
};

export function TickerBar({ items, speed = 28 }: TickerBarProps) {
  if (!items || items.length === 0) return null;

  // Quadruple small item arrays to guarantee full viewport track coverage
  const duplicatedItems = items.length < 10
    ? [...items, ...items, ...items, ...items]
    : [...items, ...items];

  const tickerStyle: TickerStyle = {
    "--ticker-duration": `${Math.max(speed, 1)}s`,
  };

  return (
    <section
      className="group relative w-full overflow-hidden border-y border-white/10"
      style={{ backgroundColor: "#081d4a", color: "#ffffff" }}
      aria-label="MindVisionTech highlights"
    >
      <div
        className="ticker-track flex w-max shrink-0 items-center whitespace-nowrap will-change-transform group-hover:[animation-play-state:paused]"
        style={{
          ...tickerStyle,
          animation: "ticker-left var(--ticker-duration, 28s) linear infinite",
        }}
      >
        {duplicatedItems.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="flex shrink-0 items-center"
            aria-hidden={index >= items.length}
          >
            <span
              className="shrink-0 px-6 py-4 text-xs font-black uppercase tracking-[0.2em] sm:px-8 sm:text-sm"
              style={{ color: "#ffffff" }}
            >
              {item}
            </span>
            {/* Orange diamond accent */}
            <span
              className="shrink-0 text-sm font-bold sm:text-base"
              style={{ color: "#ef7e20" }}
              aria-hidden="true"
            >
              ✦
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
