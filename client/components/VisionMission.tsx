"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

// ── Content — edit copy here without touching layout ─────────────────────────
const ITEMS = [
  {
    eyebrow: "Our Vision",
    heading: "Vision",
    quote:
      "To become a leading engineering skill development institute that transforms students into industry-ready professionals through practical learning, innovation, and advanced technology.",
  },
  {
    eyebrow: "Our Mission",
    heading: "Mission",
    quote:
      "Our mission is to provide quality, practical, and industry-oriented training in engineering and emerging technologies, enabling students to convert their academic knowledge into real-world skills, develop innovative solutions, and build successful careers.",
  },
] as const;

// ── Card ──────────────────────────────────────────────────────────────────────
function VMCard({
  eyebrow,
  heading,
  quote,
  delay,
}: {
  eyebrow: string;
  heading: string;
  quote: string;
  delay: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  // once:true — only fires the first time the element enters view
  const inView = useInView(ref, { once: true, margin: "-60px" });

  // Mounted guard: same pattern used in PageHero to prevent opacity-0 freeze
  const [mounted, setMounted] = useState(false);
  useEffect(() => queueMicrotask(() => setMounted(true)), []);

  const animProps = prefersReducedMotion || !mounted
    ? { opacity: 1, y: 0 }
    : inView
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 32 };

  return (
    <motion.div
      ref={ref}
      animate={animProps}
      initial={prefersReducedMotion || !mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* Eyebrow */}
      <p
        className="eyebrow"
        style={{ color: "var(--orange)", marginBottom: 0 }}
      >
        {eyebrow}
      </p>

      {/* Serif heading */}
      <h3
        style={{
          fontFamily: "var(--font-playfair-display), Georgia, serif",
          fontSize: "clamp(26px, 3.2vw, 36px)",
          fontWeight: 700,
          fontStyle: "italic",
          color: "var(--blue-deep)",
          margin: 0,
          lineHeight: 1.2,
          letterSpacing: "-0.01em",
        }}
      >
        {heading}
      </h3>

      {/* Pull-quote */}
      <blockquote
        style={{
          borderLeft: "3px solid var(--blue)",
          paddingLeft: "22px",
          margin: "4px 0 0",
        }}
      >
        <p
          style={{
            color: "rgba(18,30,54,0.80)",
            fontSize: "clamp(15px, 1.5vw, 17px)",
            fontWeight: 500,
            lineHeight: 1.75,
            margin: 0,
            fontStyle: "italic",
          }}
        >
          &ldquo;{quote}&rdquo;
        </p>
      </blockquote>
    </motion.div>
  );
}

// ── Vertical decorative divider (desktop only) ────────────────────────────────
function VerticalDivider() {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "none",
      }}
      className="vm-divider"
    />
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
export function VisionMission() {
  return (
    <>
      {/* Inline style for the desktop-only divider */}
      <style>{`
        @media (min-width: 768px) {
          .vm-divider {
            display: block !important;
            width: 1px;
            background: linear-gradient(
              to bottom,
              transparent,
              rgba(11,43,107,0.25) 20%,
              rgba(11,43,107,0.25) 80%,
              transparent
            );
            align-self: stretch;
            flex-shrink: 0;
          }
          .vm-grid {
            display: flex !important;
            flex-direction: row !important;
            align-items: stretch;
            gap: 64px;
          }
          .vm-col {
            flex: 1;
          }
        }
      `}</style>

      <section
        style={{
          backgroundColor: "var(--cream)",
          padding: "96px 0",
          position: "relative",
        }}
        aria-labelledby="vm-heading"
      >
        {/* Visually hidden section label for accessibility */}
        <h2
          id="vm-heading"
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0,0,0,0)",
            whiteSpace: "nowrap",
          }}
        >
          Vision and Mission
        </h2>

        <div className="shell">
          {/* Section intro line */}
          <motion.p
            className="eyebrow"
            style={{
              textAlign: "center",
              marginBottom: "56px",
              color: "var(--blue)",
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            What drives us
          </motion.p>

          {/* Two-column grid */}
          <div
            className="vm-grid"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "56px",
            }}
          >
            <div className="vm-col">
              <VMCard {...ITEMS[0]} delay={0.05} />
            </div>

            <VerticalDivider />

            <div className="vm-col">
              <VMCard {...ITEMS[1]} delay={0.2} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
