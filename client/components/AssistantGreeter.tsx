"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

// ── Copy ─────────────────────────────────────────────────────────────────────
function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning.";
  if (h < 17) return "Good afternoon.";
  return "Good evening.";
}

const ROTATING_LINES = [
  "Welcome to MindVisionTech Innovation.",
  "5,000+ students placed across 200+ hiring partners.",
  "Explore our industry-aligned programs.",
  "Practical skills. Real outcomes.",
] as const;

const CYCLE_INTERVAL = 5500; // ms

// ── SVG Mascot ────────────────────────────────────────────────────────────────
function AssistantSVG() {
  return (
    <svg
      width="110"
      height="130"
      viewBox="0 0 110 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
    >
      {/* Antenna base */}
      <rect x="52" y="4" width="6" height="16" rx="3" fill="#0b2b6b" />
      {/* Antenna tip */}
      <circle cx="55" cy="4" r="4" fill="#ef7e20" />

      {/* Head */}
      <rect x="18" y="20" width="74" height="54" rx="14" fill="#081d4a" />

      {/* Visor / screen */}
      <rect x="27" y="30" width="56" height="34" rx="8" fill="#0b2b6b" />

      {/* Eye left */}
      <circle cx="40" cy="47" r="7" fill="#1a4a9e" />
      <circle cx="40" cy="47" r="4" fill="#dbe7fb" />
      <circle cx="42" cy="45" r="1.5" fill="#ffffff" />

      {/* Eye right */}
      <circle cx="70" cy="47" r="7" fill="#1a4a9e" />
      <circle cx="70" cy="47" r="4" fill="#dbe7fb" />
      <circle cx="72" cy="45" r="1.5" fill="#ffffff" />

      {/* Status light — orange accent */}
      <circle cx="55" cy="68" r="3.5" fill="#ef7e20" opacity="0.9" />

      {/* Neck */}
      <rect x="46" y="74" width="18" height="10" rx="4" fill="#081d4a" />

      {/* Body */}
      <rect x="12" y="84" width="86" height="36" rx="14" fill="#0b2b6b" />

      {/* Chest panel */}
      <rect x="26" y="93" width="58" height="18" rx="6" fill="#081d4a" />

      {/* Chest indicator bars */}
      <rect x="33" y="99" width="10" height="5" rx="2.5" fill="#1a4a9e" />
      <rect x="50" y="99" width="10" height="5" rx="2.5" fill="#1a4a9e" />
      <rect x="67" y="99" width="10" height="5" rx="2.5" fill="#ef7e20" opacity="0.7" />

      {/* Left arm */}
      <rect x="0" y="88" width="12" height="26" rx="6" fill="#0b2b6b" />
      {/* Right arm */}
      <rect x="98" y="88" width="12" height="26" rx="6" fill="#0b2b6b" />

      {/* Legs */}
      <rect x="28" y="120" width="20" height="10" rx="5" fill="#081d4a" />
      <rect x="62" y="120" width="20" height="10" rx="5" fill="#081d4a" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export function AssistantGreeter() {
  const prefersReducedMotion = useReducedMotion();
  const [greeting, setGreeting] = useState("");
  const [lineIndex, setLineIndex] = useReducer(
    (i: number) => (i + 1) % ROTATING_LINES.length,
    0
  );
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hydrate greeting client-side only (avoids SSR mismatch)
  useEffect(() => {
    setGreeting(getTimeGreeting());
    setMounted(true);
  }, []);

  // Rotate copy lines
  useEffect(() => {
    if (!mounted) return;
    intervalRef.current = setInterval(setLineIndex, CYCLE_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mounted]);

  // ── Breathing animation (idle pulse) ──────────────────────────────────────
  const breatheAnimation = prefersReducedMotion
    ? {}
    : {
        animate: {
          scale: [1, 1.012, 1],
          opacity: [1, 0.92, 1],
        },
        transition: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
      };

  // ── Entrance animation ────────────────────────────────────────────────────
  const entranceProps = prefersReducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, ease: "easeOut" as const },
      };

  return (
    <motion.div
      {...entranceProps}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        userSelect: "none",
      }}
      aria-label="Assistant greeter"
    >
      {/* Mascot with breathing */}
      <motion.div {...breatheAnimation} style={{ lineHeight: 0 }}>
        <AssistantSVG />
      </motion.div>

      {/* Speech bubble */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid rgba(11,43,107,0.15)",
          borderRadius: "12px",
          boxShadow: "0 2px 12px rgba(11,43,107,0.08)",
          maxWidth: "220px",
          padding: "14px 18px",
          position: "relative",
        }}
      >
        {/* Bubble pointer */}
        <div
          style={{
            position: "absolute",
            top: "-8px",
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderBottom: "8px solid rgba(11,43,107,0.15)",
          }}
          aria-hidden="true"
        />
        <div
          style={{
            position: "absolute",
            top: "-7px",
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "7px solid transparent",
            borderRight: "7px solid transparent",
            borderBottom: "7px solid #ffffff",
          }}
          aria-hidden="true"
        />

        {/* Greeting line — static */}
        <p
          style={{
            color: "#081d4a",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.01em",
            margin: "0 0 6px",
          }}
        >
          {mounted ? greeting : ""}
        </p>

        {/* Rotating line */}
        <div style={{ minHeight: "36px", position: "relative" }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={lineIndex}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{
                color: "rgba(18,30,54,0.70)",
                fontSize: "12px",
                fontWeight: 500,
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {ROTATING_LINES[lineIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
