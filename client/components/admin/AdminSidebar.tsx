"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { adminLogout } from "@/lib/adminApi";
import { useRouter } from "next/navigation";

const TRACKS = [
  { label: "3 Day Program", slug: "3-day" },
  { label: "5 Day Program", slug: "5-day" },
  { label: "12 Day Program", slug: "12-day" },
];

const NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [internshipsOpen, setInternshipsOpen] = useState(
    pathname.startsWith("/admin/internships")
  );

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await adminLogout();
    } finally {
      router.push("/admin/login");
    }
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2 border-b border-white/10 px-6 py-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-orange font-black text-white text-sm">
          M
        </span>
        <div>
          <p className="text-sm font-black text-white leading-none">MindVisionTech</p>
          <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wider mt-0.5">
            Admin Panel
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                active
                  ? "bg-white text-brand-blue shadow-sm"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}

        {/* Internships accordion */}
        <div>
          <button
            onClick={() => setInternshipsOpen((v) => !v)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
              pathname.startsWith("/admin/internships")
                ? "bg-white/15 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <GraduationCap className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Internship Materials</span>
            <ChevronRight
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                internshipsOpen ? "rotate-90" : ""
              }`}
            />
          </button>

          {internshipsOpen && (
            <div className="ml-9 mt-1 space-y-0.5">
              {TRACKS.map(({ label, slug }) => {
                const href = `/admin/internships/${slug}`;
                const active = pathname === href;
                return (
                  <Link
                    key={slug}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                      active
                        ? "bg-white text-brand-blue shadow-sm"
                        : "text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-white/10 px-3 py-4">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {loggingOut ? "Logging out…" : "Logout"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-brand-blue min-h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex h-14 items-center justify-between bg-brand-blue px-4 shadow-md">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-orange font-black text-white text-sm">
            M
          </span>
          <span className="text-sm font-black text-white">Admin Panel</span>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setOpen(false)}
        >
          <aside
            className="h-full w-64 bg-brand-blue"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
