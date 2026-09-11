"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { TickerBar } from "@/components/TickerBar";

const defaultTickerItems = [
  "CAREER SUPPORT",
  "TECHNICAL TRAINING",
  "AI INTEGRATED CAMPUS",
  "100% PLACEMENT SUPPORT",
  "INDUSTRY PROJECTS",
  "EXPERT MENTORSHIP",
];

// ─── Floating stat badge ─────────────────────────────────────────────────────
function FloatingBadge({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className: string;
}) {
  return (
    <div
      className={`absolute rounded-2xl border border-brand-blue/20 bg-brand-blue-deep px-4 py-3 text-white shadow-blue-xl backdrop-blur-md z-20 ${className}`}
    >
      <p className="text-xl font-black text-brand-orange">{value}</p>
      <p className="text-[9px] font-bold uppercase tracking-widest text-white/90">{label}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function HeroBanner({ tickerItems = defaultTickerItems }: { tickerItems?: string[] }) {
  const badges = ["AI INTEGRATED CAMPUS", "100% PLACEMENT SUPPORT", "INDUSTRY CERTIFIED"];

  return (
    <section
      className="hero relative isolate overflow-hidden bg-gradient-to-b from-[#f8faff] via-white to-[#eef5ff] pt-2 pb-0 sm:pt-3"
      aria-label="MindVisionTech embedded systems training"
    >
      <div className="relative z-10 mx-auto grid min-h-[460px] max-w-[1440px] items-center gap-8 px-4 pt-2 pb-4 sm:px-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:px-16 lg:pt-3 lg:pb-6">

        {/* ── LEFT COLUMN — Hero content ───────────────────────────────────── */}
        <div className="relative z-20 max-w-2xl space-y-5 sm:space-y-6">

          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-orange/35 bg-brand-orange/10 px-3.5 py-1 sm:px-4 sm:py-1.5 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-brand-orange" />
            <span className="text-[10px] font-extrabold tracking-[0.2em] text-brand-orange uppercase sm:text-xs sm:tracking-[0.24em]">
              MINDVISIONTECH INNOVATION
            </span>
          </div>

          {/* Headline — High contrast dark navy + solid orange underlined text */}
          <h1 className="max-w-2xl text-3xl font-black leading-[1.1] tracking-[-0.03em] text-[#081d4a] sm:text-5xl lg:text-[56px]">
            Learn AI. Build Real Projects.{" "}
            <span className="inline-block text-brand-orange underline decoration-[3px] decoration-brand-orange underline-offset-[6px] sm:underline-offset-[10px]">
              Get Hired.
            </span>
          </h1>

          {/* Subtitle / Body Copy */}
          <p className="max-w-xl text-sm font-medium leading-relaxed text-[#121e36]/80 sm:text-lg">
            India's premiere institute for Embedded Systems, VLSI, Robotics, and PCB Design. Hands-on hardware labs and 100% placement support.
          </p>

          {/* Trust pill badges */}
          <div className="flex flex-wrap gap-2 pt-1">
            {badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-[#0b2b6b]/20 bg-white px-3 py-1 text-[10px] font-extrabold tracking-[0.08em] text-[#0b2b6b] shadow-sm sm:px-3.5 sm:py-1.5 sm:text-[11px] sm:tracking-[0.1em]"
              >
                ✓ {badge}
              </span>
            ))}
          </div>

          {/* CTA Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
            {/* Primary CTA — Orange */}
            <Link
              href="/contact#enquire"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-brand-orange px-7 py-3.5 text-sm font-black text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#d96a10] active:translate-y-0"
            >
              <span>Enquire Now</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">↗</span>
            </Link>

            {/* Secondary CTA — Dark Blue */}
            <Link
              href="/courses"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-brand-blue-deep px-7 py-3.5 text-sm font-black text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#0b2b6b] active:translate-y-0"
            >
              <span>Explore Courses</span>
              <span className="text-xs">↗</span>
            </Link>
          </div>

          {/* Trust stats counter */}
          <div className="grid grid-cols-3 gap-2 border-t border-[#0b2b6b]/15 pt-5 text-[#081d4a] sm:gap-4 sm:pt-6">
            <div>
              <p className="text-2xl font-black text-[#081d4a] sm:text-3xl">5000+</p>
              <p className="text-[9px] font-black uppercase tracking-wider text-[#121e36]/65 sm:text-[10px]">Students Placed</p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#081d4a] sm:text-3xl">200+</p>
              <p className="text-[9px] font-black uppercase tracking-wider text-[#121e36]/65 sm:text-[10px]">Hiring Partners</p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#081d4a] sm:text-3xl">25+</p>
              <p className="text-[9px] font-black uppercase tracking-wider text-[#121e36]/65 sm:text-[10px]">India Branches</p>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN — Hardware Lab visual ───────────────────────── */}
        <div className="relative flex min-h-[260px] items-center justify-center sm:min-h-[460px]">
          <div className="relative h-[250px] xs:h-[280px] w-full max-w-[680px] sm:h-[440px] lg:h-[480px] shadow-2xl shadow-[#081d4a]/20 rounded-2xl sm:rounded-[2.5rem]">
            <Image
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1800&q=90"
              alt="Engineers working on embedded hardware and robotics prototypes"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="rounded-2xl sm:rounded-[2.5rem] object-cover object-center border border-[#0b2b6b]/15"
            />

            {/* Bottom hardware lab caption overlay */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 rounded-xl sm:rounded-2xl border border-white/20 bg-[#081d4a]/95 px-3.5 py-2.5 sm:px-5 sm:py-4 text-white backdrop-blur-md shadow-lg">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] sm:tracking-[0.24em] text-brand-orange uppercase">HARDWARE LAB / 01</p>
                  <p className="mt-0.5 text-xs sm:text-base font-extrabold text-white">Prototype. Test. Deploy.</p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-orange/20 px-2.5 py-0.5 sm:px-3.5 sm:py-1 text-[10px] sm:text-xs font-bold text-brand-orange border border-brand-orange/30">
                  LIVE LABS
                </span>
              </div>
            </div>
          </div>

          {/* Floating Stat Badges — visible from sm breakpoint upwards */}
          <FloatingBadge
            value="50+"
            label="AWARDS WON"
            className="hidden sm:block left-0 top-[6%] sm:left-[-2%]"
          />
          <FloatingBadge
            value="25+"
            label="BRANCHES"
            className="hidden sm:block bottom-[12%] right-0 sm:right-[-2%]"
          />
        </div>
      </div>

      {/* ── TickerBar forming the bottom edge of the Hero section ────────────── */}
      <div className="relative z-20 w-full mt-6">
        <TickerBar items={tickerItems} speed={28} />
      </div>
    </section>
  );
}
