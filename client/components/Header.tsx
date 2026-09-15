"use client";

import Link from "next/link";
import { Mail, Phone, Award, ShieldCheck, CheckCircle2 } from "lucide-react";
import { companyInfo } from "@/data/company";
import { Navbar } from "@/components/Navbar";
import { MindVisionLogo } from "@/components/MindVisionLogo";

// ─── 1. TOP INFO STRIP ──────────────────────────────────────────────────────
function TopInfoStrip() {
  return (
    <div className="w-full bg-[#061535] text-white/90 text-[11px] sm:text-xs border-b border-white/10 select-none">
      <div className="mx-auto flex max-w-[1550px] items-center justify-between px-4 py-1.5 sm:px-6 lg:px-8">
        {/* Left: Tagline with small icon */}
        <div className="flex items-center gap-2">
          <Award className="h-3.5 w-3.5 text-brand-orange shrink-0" />
          <span className="font-semibold tracking-wide text-white/95 truncate">
            MindVision Tech&apos;s Most Trusted Software &amp; Embedded Training Institute
          </span>
        </div>

        {/* Right: Contact Email & Phone */}
        <div className="hidden sm:flex items-center gap-5 text-white/80 shrink-0">
          <a
            href={companyInfo.emailHref}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Mail className="h-3.5 w-3.5 text-brand-orange" />
            <span className="font-medium">{companyInfo.email}</span>
          </a>

          <span className="text-white/30">|</span>

          <a
            href={companyInfo.phoneHref}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="h-3.5 w-3.5 text-brand-orange" />
            <span className="font-bold text-white tracking-wide">{companyInfo.phone}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── 2. MAIN HEADER (WHITE BACKGROUND) ──────────────────────────────────────
function CertificationBadges() {
  const badges = [
    {
      title: "ISO 9001:2015",
      subtitle: "Certified Training",
      icon: ShieldCheck,
      color: "text-blue-700 bg-blue-50 border-blue-200",
    },
    {
      title: "Skill India",
      subtitle: "Aligned Curriculum",
      icon: Award,
      color: "text-amber-700 bg-amber-50 border-amber-200",
    },
    {
      title: "Govt. MSME",
      subtitle: "Registered Entity",
      icon: CheckCircle2,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
  ];

  return (
    <div className="hidden md:flex items-center gap-3">
      {badges.map((b) => {
        const Icon = b.icon;
        return (
          <div
            key={b.title}
            className={`flex items-center gap-2.5 rounded-lg border px-3 py-1.5 shadow-2xs transition-transform hover:-translate-y-0.5 ${b.color}`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <div className="leading-tight text-left">
              <div className="text-[11px] font-black tracking-tight uppercase">
                {b.title}
              </div>
              <div className="text-[9px] font-bold opacity-80 uppercase tracking-wider">
                {b.subtitle}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Header() {
  return (
    <header className="w-full">
      {/* 1. Top Info Strip */}
      <TopInfoStrip />

      {/* 2. Main Header: White Background with Logo & Certification Badges */}
      <div className="w-full bg-white border-b border-slate-100">
        <div className="mx-auto flex max-w-[1550px] items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center"
            aria-label="MindVisionTech home"
          >
            <MindVisionLogo className="h-auto w-52 sm:w-64 lg:w-[310px]" />
          </Link>

          {/* Right side: 3 certification/partner badges */}
          <CertificationBadges />
        </div>
      </div>

      {/* 3. Navigation Bar: Solid Blue Background (Sticky) */}
      <Navbar />
    </header>
  );
}
