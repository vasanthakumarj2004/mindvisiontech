"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Cpu,
  Wifi,
  Zap,
  Code2,
  PhoneCall,
  GraduationCap,
  Sparkles,
  MapPin,
} from "lucide-react";
import { TickerBar } from "@/components/TickerBar";
import { companyInfo } from "@/data/company";
import { submitLead } from "@/lib/api";

// ─── Lightweight placeholder while 3D WebGL scene compiles ─────────────────
function Hero3DPlaceholder() {
  return (
    <div className="relative h-full w-full rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-[#061535] via-[#081d4a] to-[#040e24] flex items-center justify-center border border-brand-blue/20">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-orange/90">
          Loading 3D Hardware Lab...
        </p>
      </div>
    </div>
  );
}

const Hero3DModel = dynamic(
  () => import("@/components/Hero3DModel").then((m) => m.Hero3DModel),
  {
    ssr: false,
    loading: () => <Hero3DPlaceholder />,
  }
);

const defaultTickerItems = [
  "CAREER SUPPORT",
  "TECHNICAL TRAINING",
  "AI INTEGRATED CAMPUS",
  "PRACTICAL PROJECTS",
  "INDUSTRY PROJECTS",
  "EXPERT MENTORSHIP",
];

// ─── Floating stat badge (compacted proportionally) ──────────────────────────
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
      className={`absolute rounded-xl sm:rounded-2xl border border-yellow-400/40 bg-[#081d4a]/95 px-3 py-2 sm:px-3.5 sm:py-2.5 text-white shadow-lg backdrop-blur-md z-20 ${className}`}
    >
      <p className="text-base sm:text-lg font-black text-yellow-400 flex items-center gap-1">
        <span>★</span> {value}
      </p>
      <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-white/90">{label}</p>
    </div>
  );
}

// ─── Slide 1: Original Brand & 3D Hardware Lab ──────────────────────────────
function SlideOneContent({
  visualMode,
  setVisualMode,
  badges,
}: {
  visualMode: "3d" | "photo";
  setVisualMode: (mode: "3d" | "photo") => void;
  badges: string[];
}) {
  return (
    <div className="grid w-full items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
      {/* LEFT COLUMN — Hero content */}
      <div className="relative z-20 max-w-2xl space-y-3 sm:space-y-3.5">
        {/* Announcement Ribbon */}
        <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/50 bg-amber-400/15 px-3 py-0.5 text-[10px] sm:text-[11px] font-black text-amber-900 shadow-2xs">
          <span className="flex h-2 w-2 rounded-full bg-yellow-400 animate-ping" />
          <span className="text-amber-600 font-black">⚡ 2026 BATCHES OPEN:</span>
          <span className="text-brand-navy font-bold">Practical learning &amp; live hardware labs</span>
        </div>

        {/* Eyebrow badge + 5-Star Rating */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-orange/35 bg-brand-orange/10 px-3 py-0.5 sm:px-3.5 sm:py-1 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
            <span className="text-[9px] font-extrabold tracking-[0.2em] text-brand-orange uppercase sm:text-[10px] sm:tracking-[0.22em]">
              MINDVISIONTECH INNOVATION
            </span>
          </div>

        </div>

        {/* Headline — Scaled down proportionally for shorter container */}
        <h1 className="max-w-xl text-2xl font-black leading-[1.12] tracking-[-0.03em] text-[#081d4a] sm:text-4xl lg:text-[42px] xl:text-[46px]">
          Learn AI. Build Real Projects.{" "}
          <span className="inline-block text-brand-orange underline decoration-[3px] sm:decoration-[4px] decoration-yellow-400 underline-offset-[5px] sm:underline-offset-[8px]">
            Get Hired.
          </span>
        </h1>

        {/* Subtitle / Body Copy */}
        <p className="max-w-lg text-xs font-medium leading-relaxed text-[#121e36]/80 sm:text-base">
          India&apos;s premiere institute for Embedded Systems, VLSI, Robotics, and PCB Design. Hands-on hardware labs and career guidance.
        </p>

        {/* Trust pill badges */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-amber-300/40 bg-white px-2.5 py-0.5 text-[9px] font-extrabold tracking-[0.06em] text-[#0b2b6b] shadow-sm sm:px-3 sm:py-1 sm:text-[10px] sm:tracking-[0.08em]"
            >
              <span className="text-yellow-500 font-bold mr-1">★</span>
              {badge}
            </span>
          ))}
        </div>

        {/* CTA Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1">
          {/* Primary CTA — Orange */}
          <Link
            href="/contact#enquire"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full bg-brand-orange px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-black text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#d96a10] active:translate-y-0"
          >
            <span>Enquire Now</span>
            <span className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-white/20 text-xs">↗</span>
          </Link>

          {/* Secondary CTA — Dark Blue */}
          <Link
            href="/courses"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full bg-brand-blue-deep px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-black text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#0b2b6b] active:translate-y-0"
          >
            <span>Explore Courses</span>
            <span className="text-xs">↗</span>
          </Link>
        </div>

      </div>

      {/* RIGHT COLUMN — Scaled-down Hardware Lab visual */}
      <div className="relative flex min-h-[220px] items-center justify-center sm:min-h-[360px]">
        <div className="relative h-[220px] xs:h-[240px] w-full max-w-[580px] sm:h-[350px] lg:h-[380px] shadow-xl shadow-[#081d4a]/20 rounded-2xl sm:rounded-[2rem] overflow-hidden">
          {/* Mobile View: Static image */}
          <div className="relative h-full w-full block sm:hidden">
            <Image
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1800&q=90"
              alt="Engineers working on embedded hardware and robotics prototypes"
              fill
              priority
              sizes="100vw"
              className="rounded-2xl object-cover object-center border border-[#0b2b6b]/15"
            />
          </div>

          {/* Desktop View: Interactive 3D Model with mode switch */}
          <div className="relative h-full w-full hidden sm:block">
            {visualMode === "3d" ? (
              <Hero3DModel />
            ) : (
              <Image
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1800&q=90"
                alt="Engineers working on embedded hardware and robotics prototypes"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="rounded-[2rem] object-cover object-center border border-[#0b2b6b]/15"
              />
            )}
          </div>

          {/* Bottom hardware lab caption overlay */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3.5 sm:left-3.5 sm:right-3.5 rounded-xl border border-white/20 bg-[#081d4a]/95 px-3 py-2 sm:px-4 sm:py-2.5 text-white backdrop-blur-md shadow-lg z-20">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[8px] sm:text-[9px] font-bold tracking-[0.2em] text-brand-orange uppercase">
                  {visualMode === "3d" ? "3D HARDWARE LAB / 01" : "HARDWARE LAB / 01"}
                </p>
                <p className="mt-0.5 text-xs sm:text-sm font-extrabold text-white">
                  {visualMode === "3d" ? "Embedded Microchip & PCB" : "Prototype. Test. Deploy."}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="hidden sm:flex items-center rounded-full bg-white/10 p-0.5 border border-white/15">
                  <button
                    onClick={() => setVisualMode("3d")}
                    type="button"
                    aria-pressed={visualMode === "3d"}
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold transition-all cursor-pointer ${
                      visualMode === "3d"
                        ? "bg-brand-orange text-white shadow-xs"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    3D PCB
                  </button>
                  <button
                    onClick={() => setVisualMode("photo")}
                    type="button"
                    aria-pressed={visualMode === "photo"}
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold transition-all cursor-pointer ${
                      visualMode === "photo"
                        ? "bg-brand-orange text-white shadow-xs"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    Lab Photo
                  </button>
                </div>

                <span className="shrink-0 rounded-full bg-brand-orange/20 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-brand-orange border border-brand-orange/30">
                  LIVE LABS
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Slide 2: Course-Focused Banner (Warm Amber/Yellow Accent) ──────────────
function SlideTwoContent() {
  const courseCards = [
    {
      title: "Embedded Systems",
      slug: "embedded-systems",
      category: "Electrical & Electronics",
      duration: "6 Months",
      icon: Cpu,
    },
    {
      title: "Internet of Things (IoT)",
      slug: "internet-of-things-iot",
      category: "Electrical & Electronics",
      duration: "5 Months",
      icon: Wifi,
    },
    {
      title: "EV Technology",
      slug: "electric-vehicle-technology",
      category: "Electrical & Electronics",
      duration: "6 Months",
      icon: Zap,
    },
    {
      title: "Python Full Stack",
      slug: "python-full-stack",
      category: "Software Courses",
      duration: "6 Months",
      icon: Code2,
    },
  ];

  return (
    <div className="grid w-full items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
      {/* LEFT COLUMN — Course-focused content (Dark Navy text for AAA contrast) */}
      <div className="relative z-20 max-w-2xl space-y-3 sm:space-y-3.5">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-600/35 bg-amber-500/15 px-3 py-0.5 text-[10px] sm:text-[11px] font-black text-[#78350F] shadow-2xs">
          <span className="flex h-2 w-2 rounded-full bg-amber-600 animate-ping" />
          <span className="font-black">EXPLORE OUR COURSES</span>
          <span className="text-[#92400E] font-bold">• 2026 Batch Curriculum</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-700/25 bg-white/90 px-3 py-0.5 sm:px-3.5 sm:py-1 shadow-xs">
            <GraduationCap className="h-3 w-3 text-[#B45309]" />
            <span className="text-[9px] font-extrabold tracking-[0.2em] text-[#081d4a] uppercase sm:text-[10px] sm:tracking-[0.22em]">
              INDUSTRY-CERTIFIED TRACKS
            </span>
          </div>

          <div className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-white/90 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-[#081d4a] shadow-2xs">
            <span className="text-amber-600 text-xs">★★★★★</span>
            <span className="text-[#081d4a]/90 font-bold">Hands-on practical labs</span>
          </div>
        </div>

        {/* Headline — Scaled down proportionally */}
        <h2 className="max-w-xl text-2xl font-black leading-[1.12] tracking-[-0.03em] text-[#081d4a] sm:text-4xl lg:text-[42px] xl:text-[46px]">
          6 Industry-Ready Programs.{" "}
          <span className="inline-block text-[#B45309] underline decoration-[3px] sm:decoration-[4px] decoration-amber-500 underline-offset-[5px] sm:underline-offset-[8px]">
            One Career Launchpad.
          </span>
        </h2>

        {/* Subtitle / Body Copy */}
        <p className="max-w-lg text-xs font-semibold leading-relaxed text-[#121e36]/90 sm:text-base">
          From Embedded Systems to Full Stack Development — hands-on training across Electrical, Electronics, and Software domains.
        </p>

        {/* Small course category chips/pills */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {[
            { name: "Embedded Systems", href: "/courses/embedded-systems", icon: Cpu },
            { name: "IoT", href: "/courses/internet-of-things-iot", icon: Wifi },
            { name: "EV Technology", href: "/courses/electric-vehicle-technology", icon: Zap },
            { name: "Full Stack", href: "/courses/python-full-stack", icon: Code2 },
          ].map((chip) => {
            const Icon = chip.icon;
            return (
              <Link
                key={chip.name}
                href={chip.href}
                className="group/chip inline-flex items-center gap-1.5 rounded-full border border-amber-600/30 bg-white/95 px-3 py-1 text-[10px] sm:text-[11px] font-black tracking-wide text-[#081d4a] shadow-xs transition-all hover:-translate-y-0.5 hover:border-[#081d4a] hover:bg-[#081d4a] hover:text-white"
              >
                <Icon className="h-3 w-3 text-amber-700 group-hover/chip:text-amber-300 transition-colors" />
                <span>{chip.name}</span>
                <span className="text-[9px] opacity-60 group-hover/chip:opacity-100">↗</span>
              </Link>
            );
          })}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1">
          {/* Primary CTA */}
          <Link
            href="/courses"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full bg-[#081d4a] px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-black text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#0b2b6b] active:translate-y-0"
          >
            <span>View All Courses</span>
            <span className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-white/20 text-xs">↗</span>
          </Link>

          {/* Secondary CTA */}
          <Link
            href="/contact#enquire"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full border-2 border-[#081d4a]/30 bg-white/85 px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-black text-[#081d4a] shadow-xs transition-all hover:-translate-y-0.5 hover:bg-white hover:border-[#081d4a] active:translate-y-0"
          >
            <span>Download Syllabus</span>
            <span className="text-xs">↗</span>
          </Link>
        </div>

      </div>

      {/* RIGHT COLUMN — 4 Compact Course Thumbnail Cards Grid */}
      <div className="relative flex items-center justify-center">
        <div className="grid w-full max-w-[540px] grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {courseCards.map((course, idx) => {
            const Icon = course.icon;
            return (
              <Link
                key={course.slug}
                href={`/courses/${course.slug}`}
                className="group relative rounded-xl sm:rounded-2xl border-2 border-amber-300/60 bg-white/95 p-3 sm:p-3.5 shadow-md backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#081d4a] hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100/90 text-[#B45309] shadow-2xs group-hover:bg-[#081d4a] group-hover:text-white transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="rounded-full bg-amber-100/70 px-2 py-0.5 text-[9px] font-black text-[#78350F]">
                      0{idx + 1}
                    </span>
                  </div>

                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-amber-700">
                    {course.category}
                  </p>
                  <h3 className="mt-0.5 text-sm sm:text-base font-black text-[#081d4a] group-hover:text-brand-orange transition-colors">
                    {course.title}
                  </h3>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-amber-200/60 pt-2 text-[11px] font-bold text-[#121e36]/80">
                  <span>⏱ {course.duration}</span>
                  <span className="inline-flex items-center gap-0.5 font-extrabold text-[#081d4a] group-hover:text-brand-orange">
                    <span>Explore</span>
                    <span className="text-xs transition-transform group-hover:translate-x-0.5">↗</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <FloatingBadge
          value="LAB"
          label="PRACTICAL LEARNING"
          className="hidden sm:block -bottom-3 -left-2 bg-[#081d4a]/95 text-white"
        />
      </div>
    </div>
  );
}

// ─── Slide 3: Admissions & Lead Capture (Deep Emerald Teal Accent) ───────────
function SlideThreeContent({
  onFormFocus,
  onFormBlur,
}: {
  onFormFocus: () => void;
  onFormBlur: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCallbackSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsSubmitting(true);

    const enquiryLines = [
      "📋 *Fast-Track Admission Callback — MindVisionTech*",
      "──────────────────────────────",
      `👤 *Name:* ${name.trim()}`,
      `📞 *Phone:* ${phone.trim()}`,
      `🎯 *Interest:* 2026 Batch Course Guidance, Fee Structure & Placement Stats`,
      "──────────────────────────────",
      "_Submitted via the MindVisionTech Homepage Banner (Slide 3)._",
    ];

    const encodedMessage = encodeURIComponent(enquiryLines.join("\n"));
    const waUrl = `https://wa.me/${companyInfo.whatsapp}?text=${encodedMessage}`;

    // Non-blocking lead logging
    submitLead({
      name: name.trim(),
      phone: phone.trim(),
      email: "callback-lead@mindvisiontech.com",
      message: "Direct callback request from Hero Carousel Slide 3",
    }).catch(() => {});

    try {
      window.open(waUrl, "_blank", "noopener,noreferrer");
    } catch {}

    setIsSubmitted(true);
    setIsSubmitting(false);
  }

  return (
    <div className="grid w-full items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
      {/* LEFT COLUMN — Admissions & Callback Form */}
      <div className="relative z-20 max-w-2xl space-y-3 sm:space-y-3.5 text-white">
        {/* Urgency Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-3 py-0.5 text-[10px] sm:text-[11px] font-black text-emerald-300 shadow-2xs">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-black text-yellow-400">LIMITED SEATS:</span>
          <span className="text-white font-bold">2026 Batch Admissions Open</span>
        </div>

        {/* Eyebrow + Instant Response badge */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-white/10 px-3 py-0.5 sm:px-3.5 sm:py-1 backdrop-blur-sm shadow-xs">
            <PhoneCall className="h-3 w-3 text-emerald-300" />
            <span className="text-[9px] font-extrabold tracking-[0.2em] text-emerald-200 uppercase sm:text-[10px] sm:tracking-[0.22em]">
              ADMISSIONS DESK
            </span>
          </div>

          <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-white backdrop-blur-sm shadow-2xs">
            <span className="text-yellow-400 text-xs">⚡</span>
            <span className="text-white/95 font-bold">Direct Counselor WhatsApp</span>
          </div>
        </div>

        {/* Headline — Scaled down proportionally */}
        <h2 className="max-w-xl text-2xl font-black leading-[1.12] tracking-[-0.03em] text-white sm:text-4xl lg:text-[42px] xl:text-[46px]">
          Your Career in Tech Starts With{" "}
          <span className="inline-block text-yellow-400 underline decoration-[3px] sm:decoration-[4px] decoration-emerald-400 underline-offset-[5px] sm:underline-offset-[8px]">
            One Conversation.
          </span>
        </h2>

        {/* Subtitle / Body Copy */}
        <p className="max-w-lg text-xs font-medium leading-relaxed text-emerald-100/95 sm:text-base">
          Talk to our admissions team — get course guidance, fee details, and placement stats in one call.
        </p>

        {/* Compact Inline Enquiry Form */}
        <div className="rounded-xl sm:rounded-2xl border border-white/25 bg-white/10 p-3.5 sm:p-4 backdrop-blur-lg shadow-xl max-w-lg">
          {isSubmitted ? (
            <div className="space-y-1.5 py-1 text-center">
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white font-black text-sm">
                ✓
              </div>
              <h4 className="text-sm font-black text-white">Callback Request Prepared!</h4>
              <p className="text-[11px] text-emerald-200">
                WhatsApp is opening to connect you directly with an admissions counselor.
              </p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="mt-1 text-[11px] font-bold text-yellow-400 hover:underline cursor-pointer"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleCallbackSubmit} className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label htmlFor="slide-lead-name" className="sr-only">
                    Your Full Name
                  </label>
                  <input
                    id="slide-lead-name"
                    type="text"
                    required
                    placeholder="Your Full Name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={onFormFocus}
                    onBlur={onFormBlur}
                    className="w-full rounded-lg sm:rounded-xl border border-white/30 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-brand-navy placeholder:text-brand-navy/50 outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label htmlFor="slide-lead-phone" className="sr-only">
                    Mobile Number
                  </label>
                  <input
                    id="slide-lead-phone"
                    type="tel"
                    required
                    placeholder="Mobile Number *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onFocus={onFormFocus}
                    onBlur={onFormBlur}
                    className="w-full rounded-lg sm:rounded-xl border border-white/30 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-brand-navy placeholder:text-brand-navy/50 outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-0.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg sm:rounded-xl bg-brand-orange px-5 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#d96a10] active:scale-95 cursor-pointer disabled:opacity-75"
                >
                  <span>{isSubmitting ? "Connecting..." : "Get Callback"}</span>
                  <span className="text-sm">↗</span>
                </button>

                <Link
                  href="/contact#enquire"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg sm:rounded-xl border border-white/30 bg-white/15 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-white/25 transition-all text-center"
                >
                  <span>Detailed Form</span>
                  <span className="text-xs">↗</span>
                </Link>
              </div>

              <p className="text-[10px] text-emerald-200/80 text-center sm:text-left flex items-center justify-center sm:justify-start gap-2 pt-0.5">
                <span>🔒 No spam guaranteed</span>
                <span>•</span>
                <span>⚡ Instant WhatsApp guidance</span>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN — Practical support highlights */}
      <div className="relative flex items-center justify-center py-2">
        <div className="grid w-full max-w-[540px] grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          <div className="rounded-xl sm:rounded-2xl border border-white/20 bg-white/10 p-3.5 sm:p-4 backdrop-blur-md shadow-lg text-white">
            <Sparkles className="mb-2 h-5 w-5 text-yellow-400" />
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-200">
              Course Guidance
            </p>
            <p className="mt-0.5 text-[11px] text-white/80 leading-relaxed line-clamp-1 sm:line-clamp-none">
              Choose a learning path that fits your goals.
            </p>
          </div>

          <div className="rounded-xl sm:rounded-2xl border border-white/20 bg-white/10 p-3.5 sm:p-4 backdrop-blur-md shadow-lg text-white">
            <GraduationCap className="mb-2 h-5 w-5 text-emerald-300" />
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-200">
              Project Learning
            </p>
            <p className="mt-0.5 text-[11px] text-white/80 leading-relaxed line-clamp-1 sm:line-clamp-none">
              Build practical skills through guided projects.
            </p>
          </div>

          <div className="rounded-xl sm:rounded-2xl border border-white/20 bg-white/10 p-3.5 sm:p-4 backdrop-blur-md shadow-lg text-white">
            <PhoneCall className="mb-2 h-5 w-5 text-yellow-400" />
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-200">
              Counsellor Support
            </p>
            <p className="mt-0.5 text-[11px] text-white/80 leading-relaxed line-clamp-1 sm:line-clamp-none">
              Get answers about admissions and course details.
            </p>
          </div>

          <div className="rounded-xl sm:rounded-2xl border border-white/20 bg-white/10 p-3.5 sm:p-4 backdrop-blur-md shadow-lg text-white">
            <MapPin className="mb-2 h-5 w-5 text-emerald-300" />
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-200">
              Visit Our Campus
            </p>
            <p className="mt-0.5 text-[11px] text-white/80 leading-relaxed line-clamp-1 sm:line-clamp-none">
              Explore hands-on learning at our Coimbatore HQ.
            </p>
          </div>
        </div>

        {/* Floating Badges */}
        <FloatingBadge
          value="LAB"
          label="HANDS-ON LEARNING"
          className="hidden sm:block -top-3 -right-2 bg-black/60 border-emerald-400/40 text-white"
        />
        <FloatingBadge
          value="LIVE"
          label="PROJECT SUPPORT"
          className="hidden sm:block -bottom-3 -left-2 bg-black/60 border-emerald-400/40 text-white"
        />
      </div>
    </div>
  );
}

// ─── Main HeroBanner Component ───────────────────────────────────────────────
export function HeroBanner({ tickerItems = defaultTickerItems }: { tickerItems?: string[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isFormActive, setIsFormActive] = useState(false);
  const [visualMode, setVisualMode] = useState<"3d" | "photo">("3d");

  const badges = ["AI INTEGRATED CAMPUS", "PRACTICAL PROJECTS", "INDUSTRY MENTORSHIP"];
  const shouldReduceMotion = useReducedMotion();
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const SLIDE_COUNT = 3;

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrentSlide((prev) => (prev + newDirection + SLIDE_COUNT) % SLIDE_COUNT);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  }, [currentSlide]);

  // Auto-advance every 6.5 seconds (paused on hover or form interaction)
  useEffect(() => {
    if (isPaused || isFormActive) {
      if (autoAdvanceTimerRef.current) {
        clearInterval(autoAdvanceTimerRef.current);
      }
      return;
    }

    autoAdvanceTimerRef.current = setInterval(() => {
      paginate(1);
    }, 6500);

    return () => {
      if (autoAdvanceTimerRef.current) {
        clearInterval(autoAdvanceTimerRef.current);
      }
    };
  }, [isPaused, isFormActive, paginate]);

  // Keyboard navigation (ArrowLeft & ArrowRight)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isFormActive) return;
      if (e.key === "ArrowLeft") {
        paginate(-1);
      } else if (e.key === "ArrowRight") {
        paginate(1);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFormActive, paginate]);

  // Background configurations for smooth crossfades
  const slideBackgrounds = [
    // Slide 1: Original clean Navy gradient
    "bg-gradient-to-b from-[#f8faff] via-white to-[#eef5ff]",
    // Slide 2: Warm Amber / Golden Yellow gradient
    "bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A]",
    // Slide 3: Deep Emerald Teal gradient
    "bg-gradient-to-br from-[#062422] via-[#0D4F4A] to-[#082E2B]",
  ];

  const slideVariants = {
    enter: (dir: number) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? -40 : 40,
      opacity: 0,
    }),
  };

  return (
    <section
      className="hero relative isolate overflow-hidden pt-1 pb-0 sm:pt-2 transition-colors duration-700 select-text"
      aria-label="MindVisionTech promotional hero carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Background Crossfade Layer ── */}
      {slideBackgrounds.map((bgClass, idx) => (
        <div
          key={bgClass}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out pointer-events-none ${bgClass} ${
            currentSlide === idx ? "opacity-100 z-0" : "opacity-0 z-[-1]"
          }`}
          aria-hidden="true"
        />
      ))}

      {/* ── Ambient Radial Lighting for slides 2 & 3 ── */}
      {currentSlide === 1 && (
        <div
          className="absolute -top-28 -left-28 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
      )}
      {currentSlide === 2 && (
        <div
          className="absolute -top-28 -right-28 h-80 w-80 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* ── Main Slide Viewport with Framer Motion (Proportionally Reduced Height) ── */}
      <div className={`relative z-10 mx-auto flex max-w-[1440px] items-start px-4 pb-10 pt-5 sm:h-[570px] sm:items-center sm:px-8 sm:pb-12 sm:pt-1 lg:h-[500px] lg:px-12 lg:pb-12 lg:pt-2 ${currentSlide === 0 ? "h-[680px]" : "h-[940px]"}`}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "tween", duration: shouldReduceMotion ? 0.01 : 0.4, ease: "easeInOut" },
              opacity: { duration: shouldReduceMotion ? 0.01 : 0.3 },
            }}
            className="w-full"
          >
            {currentSlide === 0 && (
              <SlideOneContent
                visualMode={visualMode}
                setVisualMode={setVisualMode}
                badges={badges}
              />
            )}
            {currentSlide === 1 && <SlideTwoContent />}
            {currentSlide === 2 && (
              <SlideThreeContent
                onFormFocus={() => setIsFormActive(true)}
                onFormBlur={() => setIsFormActive(false)}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Carousel Navigation Controls ── */}

        {/* Previous Button (Left) */}
        <button
          type="button"
          onClick={() => paginate(-1)}
          aria-label="Previous slide"
          className={`absolute left-1.5 sm:left-3 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border shadow-md backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer ${
            currentSlide === 2
              ? "border-white/30 bg-white/15 text-white hover:bg-white/30"
              : "border-black/10 bg-white/90 text-[#081d4a] hover:bg-white"
          }`}
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Next Button (Right) */}
        <button
          type="button"
          onClick={() => paginate(1)}
          aria-label="Next slide"
          className={`absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border shadow-md backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer ${
            currentSlide === 2
              ? "border-white/30 bg-white/15 text-white hover:bg-white/30"
              : "border-black/10 bg-white/90 text-[#081d4a] hover:bg-white"
          }`}
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* ── Dot Indicators (Bottom Center) ── */}
        <div
          className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2"
          role="tablist"
          aria-label="Hero banner carousel slides"
        >
          {[0, 1, 2].map((idx) => {
            const isActive = currentSlide === idx;
            const labels = [
              "Slide 1: Learn AI & 3D Hardware Lab",
              "Slide 2: Explore 6 Industry-Ready Courses",
              "Slide 3: Admissions & Direct Callback",
            ];

            return (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={labels[idx]}
                onClick={() => goToSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "w-7 sm:w-9 bg-brand-orange shadow-xs"
                    : currentSlide === 2
                    ? "w-2 bg-white/40 hover:bg-white/70"
                    : "w-2 bg-[#081d4a]/25 hover:bg-[#081d4a]/50"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* ── TickerBar forming the bottom edge of the Hero section ────────────── */}
      <div className="relative z-20 w-full mt-1">
        <TickerBar items={tickerItems} speed={28} />
      </div>
    </section>
  );
}
