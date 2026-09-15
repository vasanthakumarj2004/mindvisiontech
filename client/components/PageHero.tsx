"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TickerBar } from "@/components/TickerBar";

const defaultTickerItems = [
  "Embedded Systems",
  "IoT Engineering",
  "EV Technology",
  "Python Full Stack",
  "Java Full Stack",
  ".NET Full Stack",
  "Real Projects",
  "Industry Mentors",
  "Job Ready Training",
  "MindVision Tech",
];

interface PageHeroProps {
  eyebrow: string;
  heading: string;
  /** JSX or string — supports <em> for italic accent word */
  subheading?: string;
  /** Optional right-side element (stat, image, badge) */
  aside?: React.ReactNode;
}

export function PageHero({ eyebrow, heading, subheading, aside }: PageHeroProps) {
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  const fadeUp = (delayS: number) =>
    mounted && !shouldReduceMotion
      ? {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.5,
            delay: delayS,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
          },
        }
      : {
          initial: { opacity: 1, y: 0 },
          animate: { opacity: 1, y: 0 },
        };

  return (
    <section
      className="page-hero relative isolate overflow-hidden pt-1 pb-0 sm:pt-2 bg-gradient-to-br from-[#061535] via-[#081d4a] to-[#040e24] text-white select-text flex flex-col justify-between"
      style={{ minHeight: "clamp(440px, 50vh, 460px)" }}
    >
      {/* ── Ambient Radial Lighting matching Hero style ── */}
      <div
        className="absolute -top-28 -right-28 h-80 w-80 rounded-full bg-brand-orange/15 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-yellow-400/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* ── Main Hero Content Container (exact same max-width & padding as HeroBanner) ── */}
      <div className="relative z-10 mx-auto max-w-[1440px] px-4 pt-2 pb-8 sm:px-8 sm:pb-10 lg:px-12 lg:pt-3 lg:pb-10 w-full flex-1 flex items-center min-h-[380px] sm:min-h-[400px] lg:min-h-[370px]">
        <div className="grid w-full items-center gap-6 lg:grid-cols-[1.15fr_auto] lg:gap-10">
          <div className="max-w-2xl space-y-2 sm:space-y-2.5">
            {/* Eyebrow Pill Badge */}
            <motion.div {...fadeUp(0)}>
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-orange/40 bg-brand-orange/15 px-3 py-0.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-orange shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
                <span>{eyebrow}</span>
              </div>
            </motion.div>

            {/* Heading — Scaled to match HeroBanner */}
            <motion.h1
              className="text-2xl font-black leading-[1.12] tracking-[-0.03em] text-white sm:text-4xl lg:text-[42px] xl:text-[46px]"
              {...fadeUp(0.08)}
            >
              {heading}
            </motion.h1>

            {/* Subheading */}
            {subheading && (
              <motion.p
                className="text-xs sm:text-base font-medium leading-relaxed text-white/85 max-w-2xl"
                {...fadeUp(0.18)}
              >
                {subheading}
              </motion.p>
            )}
          </div>

          {/* Right Aside (if present) */}
          {aside && (
            <motion.div
              className="relative z-20 flex items-center justify-center lg:justify-end"
              {...(mounted && !shouldReduceMotion
                ? {
                    initial: { opacity: 0, scale: 0.96 },
                    animate: { opacity: 1, scale: 1 },
                    transition: { duration: 0.5, delay: 0.25 },
                  }
                : { initial: { opacity: 1, scale: 1 }, animate: { opacity: 1, scale: 1 } })}
            >
              {aside}
            </motion.div>
          )}
        </div>
      </div>

      {/* ── TickerBar forming the bottom edge across every page ── */}
      <div className="relative z-20 w-full mt-1">
        <TickerBar items={defaultTickerItems} speed={28} />
      </div>
    </section>
  );
}
