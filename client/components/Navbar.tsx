"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { label: "Home",       href: "/" },
  { label: "About Us",   href: "/about" },
  { label: "Services",   href: "/services" },
  { label: "Courses",    href: "/courses" },
  { label: "Blogs",      href: "/blogs" },
  { label: "Contact Us", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Automatically close mobile menu when navigating to another route
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function isActive(href: string) {
    return href === "/" ? pathname === href : pathname.startsWith(href);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-brand-blue/15 bg-white shadow-blue-sm">
        {/* ── Top Bar ── */}
        <div className="flex w-full items-center justify-between gap-3 px-4 py-2 sm:px-6 sm:py-2.5 lg:gap-6 lg:px-8 lg:py-3">
          {/* Logo & Brand Name */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 sm:gap-3"
            aria-label="MindVision Tech home"
            onClick={() => setIsOpen(false)}
          >
            <Image
              src="/mindvisiontech-mark.svg"
              alt="MindVision Tech logo"
              width={64}
              height={64}
              className="h-8 w-auto object-contain sm:h-9 lg:h-11 xl:h-12 transition-transform group-hover:scale-105"
              priority
            />
            <span className="select-none text-base font-extrabold leading-none tracking-tight sm:text-lg lg:text-lg xl:text-xl whitespace-nowrap">
              <span className="text-brand-blue">MINDVISION</span>{" "}
              <span className="text-brand-orange">TECH</span>
            </span>
          </Link>

          {/* Desktop Navigation Links (Visible on lg and up) */}
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

          {/* Right Area: Enquire CTA + Hamburger Button (Mobile only) */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/contact#enquire"
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-brand-orange px-3.5 py-1.5 text-xs font-bold text-white shadow-blue-sm transition-all hover:bg-[#d96a10] sm:px-5 sm:py-2 sm:text-sm"
            >
              Enquire Now
            </Link>

            {/* ── Mobile Hamburger Button ── */}
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-blue/20 bg-transparent text-brand-navy transition-colors hover:bg-brand-blue-wash active:bg-brand-blue-soft lg:hidden focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              aria-controls="mobile-navigation"
              aria-expanded={isOpen}
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setIsOpen((prev) => !prev)}
              style={{ touchAction: "manipulation" }}
            >
              {isOpen ? (
                /* Close (X) icon */
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                /* Hamburger (3 bars) icon */
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile Dropdown Menu (In-flow inside sticky header, guaranteed visibility) ── */}
        {isOpen && (
          <div
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="border-t border-brand-blue/10 bg-white px-4 pb-6 pt-3 shadow-xl lg:hidden max-h-[calc(100dvh-4rem)] sm:max-h-[calc(100dvh-4.5rem)] overflow-y-auto"
          >
            <nav className="flex flex-col space-y-1">
              {NAV.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold transition-colors ${
                      active
                        ? "bg-brand-blue text-white shadow-xs"
                        : "text-brand-navy hover:bg-brand-blue-wash hover:text-brand-blue"
                    }`}
                  >
                    <span>{item.label}</span>
                    {active && <span className="h-2 w-2 rounded-full bg-brand-orange" />}
                  </Link>
                );
              })}

              <div className="pt-2">
                <Link
                  href="/contact#enquire"
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center justify-center rounded-xl bg-brand-orange px-5 py-3.5 text-base font-bold text-white shadow-blue-md transition-all hover:bg-[#d96a10]"
                >
                  Enquire Now ↗
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ── Backdrop overlay when menu is open on mobile ── */}
      {isOpen && (
        <div
          className="fixed inset-0 top-16 sm:top-[72px] z-40 bg-black/30 backdrop-blur-[2px] lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}