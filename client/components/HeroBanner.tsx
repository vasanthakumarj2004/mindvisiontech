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
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  GraduationCap,
  Layers,
  Terminal,
  BrainCircuit,
} from "lucide-react";
import { TickerBar } from "@/components/TickerBar";
import { companyInfo } from "@/data/company";

// ─── Lightweight placeholder while 3D WebGL scene compiles ─────────────────
function Hero3DPlaceholder() {
  return (
    <div className="relative h-full w-full rounded-2xl bg-gradient-to-br from-[#061535] to-[#0a235c] flex items-center justify-center border border-white/15">
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
  "EMBEDDED SYSTEMS",
  "IOT & EV TECHNOLOGY",
  "VLSI DESIGN",
  "PYTHON & JAVA FULL STACK",
  "INDUSTRY PROJECTS",
  "EXPERT MENTORSHIP",
];

// ─── Interactive Hub & Spoke Diagram (Slide 1 Right Graphic) ────────────────
function HubAndSpokeDiagram() {
  const nodes = [
    { label: "Python", icon: Code2, x: 20, y: 22, color: "#60A5FA" },
    { label: "Java", icon: Terminal, x: 80, y: 22, color: "#F87171" },
    { label: "IoT & Cloud", icon: Wifi, x: 92, y: 55, color: "#34D399" },
    { label: "EV Tech", icon: Zap, x: 75, y: 85, color: "#FBBF24" },
    { label: "AI / ML", icon: BrainCircuit, x: 25, y: 85, color: "#A78BFA" },
    { label: "VLSI & PCB", icon: Cpu, x: 8, y: 55, color: "#38BDF8" },
  ];

  return (
    <div className="relative mx-auto flex h-[320px] w-full max-w-[460px] sm:h-[380px] lg:h-[420px] items-center justify-center">
      {/* Background radial glow */}
      <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* SVG Connecting Curved/Spoke Lines */}
      <svg
        className="absolute inset-0 h-full w-full overflow-visible pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {nodes.map((node, i) => (
          <line
            key={i}
            x1="50"
            y1="50"
            x2={node.x}
            y2={node.y}
            stroke="url(#lineGrad)"
            strokeWidth="0.8"
            strokeDasharray="2,2"
          />
        ))}
        {/* Orbit ring */}
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="0.6"
          strokeDasharray="3,3"
        />
      </svg>

      {/* Central Hub Circle */}
      <div className="relative z-10 flex h-32 w-32 sm:h-36 sm:w-36 flex-col items-center justify-center rounded-full border-2 border-white/30 bg-gradient-to-b from-[#0e3582] via-[#092257] to-[#051438] p-3 text-center shadow-2xl shadow-blue-500/30 backdrop-blur-md">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange text-white shadow-md mb-1 animate-pulse">
          <Layers className="h-4 w-4" />
        </div>
        <span className="text-[9px] font-black uppercase tracking-wider text-brand-orange">
          Core Hub
        </span>
        <span className="text-[12px] sm:text-[13px] font-black leading-tight text-white mt-0.5">
          Software &amp; Embedded
        </span>
      </div>

      {/* Orbiting Tech Nodes */}
      {nodes.map((node) => {
        const Icon = node.icon;
        return (
          <div
            key={node.label}
            style={{
              position: "absolute",
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            className="group flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-110 z-20"
          >
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-white/25 bg-[#081d4a]/90 shadow-lg backdrop-blur-md group-hover:border-white group-hover:bg-[#0c2d74] transition-all">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: node.color }} />
            </div>
            <span className="mt-1 rounded-md bg-[#061535]/80 px-2 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-white shadow-xs backdrop-blur-xs whitespace-nowrap border border-white/10">
              {node.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Floating Tech Panels (Slide 1 Center-Right) ─────────────────────────────
function TechPanelsStack() {
  return (
    <div className="hidden md:flex flex-col gap-2.5 z-20 shrink-0">
      {/* Panel 1: Code / Neural Syntax */}
      <div className="w-28 sm:w-36 h-12 sm:h-14 rounded-xl border border-cyan-400/40 bg-[#040e24]/90 p-2 shadow-[0_0_15px_rgba(6,182,212,0.25)] backdrop-blur-md flex flex-col justify-center overflow-hidden">
        <div className="flex items-center gap-1 mb-1">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[8px] font-mono font-bold text-cyan-300">Neural.py</span>
        </div>
        <div className="space-y-0.5 font-mono text-[7px] text-cyan-400/80 leading-none">
          <p className="truncate">import torch.nn as nn</p>
          <p className="text-blue-300 truncate">model = Transformer()</p>
          <p className="text-cyan-200/60 truncate">loss.backward()</p>
        </div>
      </div>

      {/* Panel 2: Data Matrix / Tensor Grid */}
      <div className="w-28 sm:w-36 h-12 sm:h-14 rounded-xl border border-cyan-400/40 bg-[#040e24]/90 p-2 shadow-[0_0_15px_rgba(6,182,212,0.25)] backdrop-blur-md flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:6px_6px] opacity-40" />
        <div className="relative z-10 flex items-center gap-1.5">
          <div className="h-6 w-6 rounded-md bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-mono text-[8px] font-bold">
            99.4%
          </div>
          <div className="text-[7px] font-mono text-cyan-200">
            <span className="block font-bold text-cyan-400">TENSOR</span>
            <span>Optimized</span>
          </div>
        </div>
      </div>

      {/* Panel 3: Geodesic Network Mesh */}
      <div className="w-28 sm:w-36 h-12 sm:h-14 rounded-xl border border-cyan-400/40 bg-[#040e24]/90 p-1.5 shadow-[0_0_15px_rgba(6,182,212,0.25)] backdrop-blur-md flex items-center justify-center overflow-hidden">
        <svg className="h-10 w-10 text-cyan-400 animate-spin" style={{ animationDuration: "16s" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="12" cy="12" r="10" strokeDasharray="2 2" />
          <polygon points="12 2 22 12 12 22 2 12" opacity="0.6" />
          <line x1="2" y1="12" x2="22" y2="12" opacity="0.4" />
          <line x1="12" y1="2" x2="12" y2="22" opacity="0.4" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      </div>

      {/* Panel 4: Digital Matrix Rain */}
      <div className="w-28 sm:w-36 h-12 sm:h-14 rounded-xl border border-cyan-400/40 bg-[#040e24]/90 p-1.5 shadow-[0_0_15px_rgba(6,182,212,0.25)] backdrop-blur-md flex flex-col justify-center overflow-hidden font-mono text-[7px] text-cyan-400/75 leading-tight">
        <div className="flex justify-between text-cyan-200 font-bold">
          <span>01101</span>
          <span>10010</span>
          <span>11100</span>
        </div>
        <div className="flex justify-between text-cyan-400">
          <span>10101</span>
          <span className="text-white font-bold">01110</span>
          <span>00101</span>
        </div>
        <div className="flex justify-between text-cyan-500/80">
          <span>00110</span>
          <span>11001</span>
          <span>10110</span>
        </div>
      </div>
    </div>
  );
}

// ─── Slide 1 Component (Full-Width Banner Photo) ─────────────────────────────
function SlideOne() {
  return (
    <div className="relative w-full min-h-[460px] sm:min-h-[500px] lg:min-h-[580px] overflow-hidden">

      {/* ── Full-Width Background Photo ── */}
      <Image
        src="/images/hero-banner-ai-education.jpg"
        alt="MindVisionTech – Online Education Technology"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* ── Gen AI Badge (top-right) ── */}
      <div className="absolute top-4 right-4 sm:right-6 z-30 flex items-center justify-center rounded-2xl bg-white px-3 py-2 sm:px-4 sm:py-2.5 shadow-xl border border-white/80">
        <div className="flex flex-col items-center leading-none text-center">
          <div className="flex items-center gap-1">
            <span className="text-base sm:text-xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Ai
            </span>
            <Sparkles className="h-3 w-3 text-cyan-500 fill-cyan-400 animate-pulse" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-extrabold tracking-wider text-slate-800 uppercase mt-0.5">
            Gen AI
          </span>
        </div>
      </div>

      {/* ── Text Content (left-aligned, vertically centered) ── */}
      <div className="relative z-10 flex h-full min-h-[460px] sm:min-h-[500px] lg:min-h-[580px] items-center">
        <div className="flex flex-col space-y-4 sm:space-y-5 px-6 sm:px-12 lg:px-16 xl:px-20 max-w-sm sm:max-w-md lg:max-w-lg">

          {/* Small label */}
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-black/30 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            MindVision Tech · Industry Training
          </div>

          {/* Main Headline */}
          <h1
            className="font-black text-white text-3xl sm:text-4xl lg:text-5xl xl:text-[50px] leading-[1.08] tracking-tight"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7)" }}
          >
            Real Skills.<br />
            Real Projects.<br />
            <span className="text-brand-orange">Real Careers.</span>
          </h1>

          {/* 2 Bullet Points */}
          <ul className="space-y-2 text-white text-sm sm:text-base font-semibold"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.9)" }}>
            <li className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-brand-orange shrink-0" />
              Embedded Systems · IoT · VLSI · Full Stack
            </li>
            <li className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-brand-orange shrink-0" />
              Industry-Aligned Training Since 2020
            </li>
          </ul>

          {/* CTA */}
          <div className="pt-1 sm:pt-2">
            <Link
              href="/contact#enquire"
              className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-7 py-3 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-[#d96a10] hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <span>Enquire Now</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}

// ─── Slide 2 Component (Hardware & Embedded Labs) ───────────────────────────
function SlideTwo() {
  const [visualMode, setVisualMode] = useState<"3d" | "photo">("3d");

  return (
    <div className="grid w-full items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
      {/* Left Column: ~55% width */}
      <div className="space-y-4 sm:space-y-5 text-left">
        {/* Small label above headline */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 backdrop-blur-md">
          <Cpu className="h-3.5 w-3.5 text-brand-orange" />
          <span className="text-[11px] sm:text-xs font-black tracking-widest text-white uppercase">
            Hands-On Hardware Labs
          </span>
        </div>

        {/* Large bold multi-line headline */}
        <h2 className="text-3xl font-black leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-[52px]">
          Master Embedded Systems &amp;{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-sky-200">
            Real Hardware Design.
          </span>
        </h2>

        {/* 2 short bullet points with small icons */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-orange/20 text-brand-orange">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-white/90">
              Live Workbenches for ARM, STM32, ESP32 &amp; Circuit Fabrication
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-orange/20 text-brand-orange">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-white/90">
              Production-Grade Protocols: CAN, I2C, SPI, UART &amp; RTOS
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/courses/embedded-systems"
            className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-3 text-xs sm:text-sm font-extrabold text-white shadow-md transition-all hover:bg-[#d96a10] hover:shadow-lg active:scale-95"
          >
            <span>Embedded Syllabus</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>

          <Link
            href="/contact#enquire"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-xs sm:text-sm font-extrabold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/60 active:scale-95"
          >
            <span>Book Lab Tour</span>
          </Link>
        </div>
      </div>

      {/* Right Column: ~45% width (Hardware Artwork / 3D PCB) */}
      <div className="relative flex min-h-[260px] sm:min-h-[350px] items-center justify-center">
        <div className="relative h-[260px] w-full max-w-[500px] sm:h-[350px] lg:h-[380px] rounded-2xl sm:rounded-[2rem] overflow-hidden border border-white/20 shadow-2xl bg-[#061535]/80 backdrop-blur-md">
          {/* Mobile View: High-res hardware prototype */}
          <div className="relative h-full w-full block sm:hidden">
            <Image
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=85"
              alt="Engineers working on embedded hardware prototype"
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>

          {/* Desktop View: Interactive 3D Model with toggle */}
          <div className="relative h-full w-full hidden sm:block">
            {visualMode === "3d" ? (
              <Hero3DModel />
            ) : (
              <Image
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=85"
                alt="Engineers working on embedded hardware prototype"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover object-center"
              />
            )}
          </div>

          {/* Bottom Lab Switcher Caption */}
          <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/20 bg-[#081d4a]/90 px-3.5 py-2 text-white backdrop-blur-md flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-brand-orange">
                Hardware Lab / Prototype 01
              </p>
              <p className="text-xs sm:text-sm font-extrabold text-white">
                STM32 Microcontroller &amp; Multilayer PCB
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-1 rounded-full bg-white/10 p-0.5 border border-white/20">
              <button
                type="button"
                onClick={() => setVisualMode("3d")}
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold transition-all cursor-pointer ${
                  visualMode === "3d" ? "bg-brand-orange text-white" : "text-white/70 hover:text-white"
                }`}
              >
                3D
              </button>
              <button
                type="button"
                onClick={() => setVisualMode("photo")}
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold transition-all cursor-pointer ${
                  visualMode === "photo" ? "bg-brand-orange text-white" : "text-white/70 hover:text-white"
                }`}
              >
                Photo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main HeroBanner Component ───────────────────────────────────────────────
export function HeroBanner({ tickerItems = defaultTickerItems }: { tickerItems?: string[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const shouldReduceMotion = useReducedMotion();
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const SLIDE_COUNT = 2;

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrentSlide((prev) => (prev + newDirection + SLIDE_COUNT) % SLIDE_COUNT);
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
    },
    [currentSlide]
  );

  // Auto-advance every 6 seconds (paused on mouse enter)
  useEffect(() => {
    if (isPaused) {
      if (autoAdvanceTimerRef.current) {
        clearInterval(autoAdvanceTimerRef.current);
      }
      return;
    }

    autoAdvanceTimerRef.current = setInterval(() => {
      paginate(1);
    }, 6000);

    return () => {
      if (autoAdvanceTimerRef.current) {
        clearInterval(autoAdvanceTimerRef.current);
      }
    };
  }, [isPaused, paginate]);

  // Keyboard navigation (ArrowLeft & ArrowRight)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        paginate(-1);
      } else if (e.key === "ArrowRight") {
        paginate(1);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paginate]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? -50 : 50,
      opacity: 0,
    }),
  };

  return (
    <section
      className={`hero relative isolate overflow-hidden text-white select-text transition-colors duration-700 mt-0 pt-0 ${
        currentSlide === 0
          ? "bg-[#061b45]"
          : "bg-gradient-to-r from-[#061535] via-[#08225C] to-[#0D3B85]"
      }`}
      aria-label="MindVision Tech promotional hero carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Subtle ambient diagonal mesh overlay */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Slide Viewport */}
      <div
        className={`relative z-10 flex items-center pt-0 ${
          currentSlide === 0
            ? "w-full"
            : "mx-auto min-h-[500px] sm:min-h-[540px] lg:min-h-[560px] max-w-[1550px] px-6 py-12 sm:px-10 lg:px-16"
        }`}
      >
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
            {currentSlide === 0 && <SlideOne />}
            {currentSlide === 1 && <SlideTwo />}
          </motion.div>
        </AnimatePresence>

        {/* ── Carousel Controls: Semi-transparent circular outlined arrows ── */}
        <button
          type="button"
          onClick={() => paginate(-1)}
          aria-label="Previous slide"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md shadow-lg transition-all hover:bg-white/25 hover:border-white hover:scale-110 active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        <button
          type="button"
          onClick={() => paginate(1)}
          aria-label="Next slide"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md shadow-lg transition-all hover:bg-white/25 hover:border-white hover:scale-110 active:scale-95 cursor-pointer"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        {/* ── Dot Indicators (Bottom Center) ── */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2"
          role="tablist"
          aria-label="Hero banner carousel slides"
        >
          {[0, 1].map((idx) => {
            const isActive = currentSlide === idx;
            return (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Slide ${idx + 1}`}
                onClick={() => goToSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive ? "w-8 bg-brand-orange shadow-md" : "w-2 bg-white/30 hover:bg-white/60"
                }`}
              />
            );
          })}
        </div>
      </div>


      {/* ── TickerBar forming the bottom edge of the Hero section ────────────── */}
      <div className="relative z-20 w-full border-t border-white/10">
        <TickerBar items={tickerItems} speed={28} />
      </div>
    </section>
  );
}
