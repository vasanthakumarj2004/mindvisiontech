"use client";

import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { companyInfo } from "@/data/company";
import { Navbar } from "@/components/Navbar";
import { MindVisionLogo } from "@/components/MindVisionLogo";

// ─── 1. TOP INFO STRIP ──────────────────────────────────────────────────────
function TopInfoStrip() {
  return (
    <div className="w-full bg-[#061535] text-white/90 text-[11px] sm:text-xs border-b border-white/10 select-none">
      <div className="mx-auto flex max-w-[1550px] items-center justify-between px-4 py-1.5 sm:px-6 lg:px-8">
        {/* Left: Empty to keep the top strip compact without the tagline */}
        <div className="flex items-center gap-2" />

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

export function Header() {
  return (
    <header className="w-full">
      {/* 1. Top Info Strip */}
      <TopInfoStrip />

      {/* 2. Main Header: White Background with Logo */}
      <div className="w-full bg-white border-b border-slate-100">
        <div className="mx-auto flex max-w-[1550px] items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center"
            aria-label="MindVisionTech home"
          >
            <MindVisionLogo className="h-auto w-60 sm:w-72 lg:w-[340px] xl:w-[360px]" />
          </Link>
        </div>
      </div>

      {/* 3. Navigation Bar: Solid Blue Background (Sticky) */}
      <Navbar />
    </header>
  );
}
