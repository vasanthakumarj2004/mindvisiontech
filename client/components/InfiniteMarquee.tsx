import type { CSSProperties, ReactNode } from "react";

export type MarqueeDirection = "left" | "right";

interface InfiniteMarqueeProps<T> {
  items: T[];
  children: (item: T, index: number) => ReactNode;
  speed?: number;
  direction?: MarqueeDirection;
  ariaLabel?: string;
  /** Tailwind bg colour class for the fade-edge gradients — match the section bg */
  edgeFrom?: string;
}

type MarqueeStyle = CSSProperties & { "--marquee-duration": string; "--marquee-direction": string };

export function InfiniteMarquee<T>({
  items,
  children,
  speed = 30,
  direction = "left",
  ariaLabel = "Scrolling content",
  edgeFrom = "from-brand-blue-wash",
}: InfiniteMarqueeProps<T>) {
  if (!items.length) return null;

  // Ensure enough items exist to fill large viewports before duplicating
  const repeatedItems = items.length < 6 ? [...items, ...items, ...items] : [...items, ...items];
  // Duplicate for seamless 50% loop translation
  const fullTrack = [...repeatedItems, ...repeatedItems];

  const marqueeStyle: MarqueeStyle = {
    "--marquee-duration": `${Math.max(speed, 1)}s`,
    "--marquee-direction": direction === "right" ? "reverse" : "normal",
  };

  return (
    <div className="group relative w-full overflow-hidden py-3" aria-label={ariaLabel}>
      {/* Fade edge gradients matching section background */}
      <div
        className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-24 bg-gradient-to-r ${edgeFrom} to-transparent`}
        aria-hidden="true"
      />
      <div
        className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-24 bg-gradient-to-l ${edgeFrom} to-transparent`}
        aria-hidden="true"
      />

      {/* Single seamless flex track */}
      <div
        className="marquee-track flex w-max items-stretch gap-6 group-hover:[animation-play-state:paused]"
        style={marqueeStyle}
      >
        {fullTrack.map((item, index) => (
          <div
            className="shrink-0"
            key={index}
            aria-hidden={index >= repeatedItems.length}
          >
            {children(item, index % items.length)}
          </div>
        ))}
      </div>
    </div>
  );
}