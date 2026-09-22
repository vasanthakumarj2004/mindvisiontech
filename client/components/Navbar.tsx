"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Menu,
  X,
  ChevronDown,
  Cpu,
  Wifi,
  Zap,
  Microchip,
  Code2,
  Coffee,
  Briefcase,
  GraduationCap,
  Users2,
  Building2,
  Sparkles,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";

interface SubItem {
  label: string;
  href: string;
  description?: string;
  icon?: LucideIcon;
}

interface NavItem {
  label: string;
  href: string;
  dropdown?: SubItem[];
}

const navigationItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Courses", href: "/courses" },
  { label: "Blogs", href: "/blogs" },
  { label: "Contact Us", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<{ [key: string]: boolean }>({});
  const dropdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setIsMenuOpen(false);
      setActiveDropdown(null);
    });
  }, [pathname]);

  function isActive(item: NavItem): boolean {
    if (item.href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(item.href);
  }

  function handleMouseEnter(label: string) {
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current);
    }
    setActiveDropdown(label);
  }

  function handleMouseLeave() {
    dropdownTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  }

  function toggleMobileDropdown(label: string) {
    setMobileExpanded((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#0B2B6B] shadow-blue-md select-none border-b border-white/10">
      <div className="mx-auto flex h-14 max-w-[1550px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation Links — single row, no wrapping */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navigationItems.map((item) => {
            const active = isActive(item);
            const hasDropdown = Boolean(item.dropdown);
            const isDropped = activeDropdown === item.label;

            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => hasDropdown && handleMouseEnter(item.label)}
                onMouseLeave={() => hasDropdown && handleMouseLeave()}
              >
                <Link
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[15px] tracking-wide transition-all ${
                    active
                      ? "bg-white text-[#0B2B6B] font-bold shadow-xs"
                      : "text-white font-medium hover:bg-white/15 hover:text-white"
                  }`}
                  style={{ color: active ? "#0B2B6B" : "#FFFFFF" }}
                  aria-expanded={hasDropdown ? isDropped : undefined}
                >
                  <span className={active ? "text-[#0B2B6B]" : "text-white"}>{item.label}</span>
                  {hasDropdown && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        active ? "text-[#0B2B6B]" : "text-white"
                      } ${isDropped ? "rotate-180" : ""}`}
                    />
                  )}
                </Link>

                {/* Dropdown Menu Panel */}
                {hasDropdown && isDropped && (
                  <div className="absolute left-0 top-full pt-2 z-50 animate-fade-up">
                    <div className="w-80 rounded-2xl border border-white/15 bg-[#081D4A] p-2 shadow-2xl backdrop-blur-md">
                      <div className="space-y-0.5">
                        {item.dropdown!.map((sub) => {
                          const Icon = sub.icon;
                          return (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              onClick={() => setActiveDropdown(null)}
                              className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/10"
                            >
                              {Icon && (
                                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-orange/20 text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-colors">
                                  <Icon className="h-4 w-4" />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="text-[13px] font-bold text-white group-hover:text-brand-orange transition-colors">
                                  {sub.label}
                                </div>
                                {sub.description && (
                                  <div className="text-[11px] text-white/60 line-clamp-1">
                                    {sub.description}
                                  </div>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>

                      {/* Bottom view all link in dropdown */}
                      <div className="mt-1 border-t border-white/10 pt-1.5 px-2 pb-1">
                        <Link
                          href={item.href}
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center justify-between text-[11px] font-bold text-brand-orange hover:text-white transition-colors"
                        >
                          <span>Explore all {item.label}</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Header indicator */}
        <div className="flex lg:hidden items-center gap-2 text-white font-bold text-sm tracking-wide">
          <span className="h-2 w-2 rounded-full bg-brand-orange animate-pulse" />
        </div>

        {/* Right-aligned: High-Contrast White Pill Button "Quick Enquiry" */}
        <div className="flex items-center gap-3">
          <Link
            href="/contact#enquire"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs sm:text-sm font-extrabold text-[#0B2B6B] shadow-sm transition-all hover:bg-brand-orange hover:text-white hover:shadow-md active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5 text-brand-orange" />
            <span>Quick Enquiry</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>

          {/* Hamburger toggle button on mobile */}
          <button
            type="button"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors lg:hidden"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-white/15 bg-[#081D4A] px-4 py-4 text-white">
          <div className="flex flex-col gap-1">
            {navigationItems.map((item) => {
              const active = isActive(item);
              const hasDropdown = Boolean(item.dropdown);
              const isExpanded = mobileExpanded[item.label];

              return (
                <div key={item.label} className="border-b border-white/5 pb-1">
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
                        active
                          ? "bg-white text-[#0B2B6B]"
                          : "text-white hover:bg-white/10 hover:text-white"
                      }`}
                      style={{ color: active ? "#0B2B6B" : "#FFFFFF" }}
                    >
                      {item.label}
                    </Link>

                    {hasDropdown && (
                      <button
                        type="button"
                        aria-label={`Toggle ${item.label} sub-menu`}
                        onClick={() => toggleMobileDropdown(item.label)}
                        className="p-2 text-white hover:bg-white/10 rounded-md"
                        style={{ color: "#FFFFFF" }}
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 text-white ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Submenu on mobile */}
                  {hasDropdown && isExpanded && (
                    <div className="ml-3 mt-1 space-y-1 border-l-2 border-brand-orange/40 pl-3">
                      {item.dropdown!.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="block py-1.5 text-xs font-semibold text-white hover:text-brand-orange transition-colors"
                          style={{ color: "#FFFFFF" }}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-3">
              <Link
                href="/contact#enquire"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-brand-orange py-3 text-sm font-extrabold text-white shadow-md hover:bg-[#d96a10]"
              >
                <span>Enquire Now</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}