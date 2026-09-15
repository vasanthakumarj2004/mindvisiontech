import Link from "next/link";

export function AnnouncementRibbon() {
  return (
    <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 px-4 py-1.5 sm:py-2 text-center text-xs font-black text-brand-navy shadow-xs border-b border-amber-500/20 relative z-30">
      <div className="mx-auto max-w-[1440px] flex items-center justify-center gap-2 flex-wrap sm:flex-nowrap px-4">
        <span className="flex items-center gap-1">
          <span className="text-sm">⚡</span>
          <span>Admissions Open for 2026 Core Engineering Batches</span>
        </span>
        <span className="hidden md:inline opacity-60">|</span>
        <span className="hidden md:inline font-bold text-brand-navy/90">
          Embedded Systems, VLSI, Robotics &amp; Full Stack
        </span>
        <Link
          href="/contact#enquire"
          className="ml-1 sm:ml-2 inline-flex items-center gap-1 rounded-full bg-brand-navy px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-white transition-transform hover:scale-105 active:scale-95 whitespace-nowrap"
        >
          <span>Reserve Seat</span>
          <span>↗</span>
        </Link>
      </div>
    </div>
  );
}
