"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Home",       href: "/" },
  { label: "About Us",   href: "/about" },
  { label: "Services",   href: "/services" },
  { label: "Courses",    href: "/courses" },
  { label: "Careers",    href: "/careers" },
  { label: "Blogs",      href: "/blogs" },
  { label: "Contact Us", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === "/" ? pathname === href : pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-brand-blue/15 bg-white shadow-blue-sm">
      {/* ── Top Bar: Logo + Desktop Links + Enquire CTA ── */}
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:gap-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center" aria-label="MindVisionTech home">
          <Image
            src="/mindvisiontech-logo.svg"
            alt="MindVisionTech Innovation"
            width={160}
            height={40}
            className="h-auto w-32 sm:w-40"
            priority
          />
        </Link>

        {/* Desktop Links (Visible on screen sizes lg and up) */}
        <nav aria-label="Main navigation" className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-[13px] font-medium tracking-wide transition-all ${
                  active
                    ? "bg-brand-blue text-white font-semibold shadow-blue-sm"
                    : "text-brand-navy/80 hover:bg-brand-blue-wash hover:text-brand-blue"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="flex shrink-0 items-center">
          <Link
            href="/contact#enquire"
            className="rounded-full bg-brand-orange px-3.5 py-1.5 text-xs font-bold text-white shadow-blue-sm transition-all hover:bg-[#d96a10] sm:px-5 sm:py-2 sm:text-sm"
          >
            Enquire Now
          </Link>
        </div>
      </div>

      {/* ── Mobile Horizontal Navigation Bar (Always visible & swipeable, no hamburger menu) ── */}
      <nav
        aria-label="Mobile navigation"
        className="flex items-center gap-1.5 overflow-x-auto border-t border-brand-blue/10 px-3 py-2 lg:hidden"
        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
      >
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                active
                  ? "bg-brand-blue text-white shadow-xs"
                  : "bg-brand-blue-wash/70 text-brand-navy hover:bg-brand-blue-wash"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}