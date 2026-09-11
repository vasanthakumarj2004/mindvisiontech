"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface PageHeroProps {
  eyebrow: string;
  heading: string;
  /** JSX or string — supports <em> for italic accent word */
  subheading?: string;
  /** Optional right-side element (stat, image, badge) */
  aside?: React.ReactNode;
}

export function PageHero({ eyebrow, heading, subheading, aside }: PageHeroProps) {
  // Guard: on the server (and first paint) render fully visible so content
  // is never stuck at opacity:0 due to the App Router SSR + Framer Motion
  // hydration mismatch. Animations activate only after mount on the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const fadeUp = (delayS: number) =>
    mounted
      ? {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, delay: delayS, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
        }
      : {
          initial: { opacity: 1, y: 0 },
          animate: { opacity: 1, y: 0 },
        };

  return (
    <section
      className="page-hero"
      style={{ backgroundColor: "#081d4a", color: "#ffffff", padding: "80px 0 60px" }}
    >
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <motion.p
              className="eyebrow"
              style={{
                color: "#ef7e20",
                fontWeight: 900,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontSize: "11px",
                marginBottom: "12px",
              }}
              {...fadeUp(0)}
            >
              {eyebrow}
            </motion.p>
            <motion.h1
              style={{
                color: "#ffffff",
                fontSize: "clamp(34px, 5vw, 56px)",
                fontWeight: 900,
                lineHeight: 1.1,
                margin: "0 0 16px",
              }}
              {...fadeUp(0.08)}
            >
              {heading}
            </motion.h1>
            {subheading && (
              <motion.p
                style={{
                  color: "rgba(255, 255, 255, 0.85)",
                  fontSize: "18px",
                  maxWidth: "640px",
                  margin: 0,
                }}
                {...fadeUp(0.2)}
              >
                {subheading}
              </motion.p>
            )}
          </div>
          {aside && (
            <motion.div
              {...(mounted
                ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.6, delay: 0.3 } }
                : { initial: { opacity: 1 }, animate: { opacity: 1 } })}
            >
              {aside}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
