"use client";

import { useEffect, useState } from "react";
import { BookOpen, GraduationCap, FileText, TrendingUp } from "lucide-react";
import { getDashboardStats, type DashboardStats } from "@/lib/adminApi";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
          <p className="mt-2 text-3xl font-black text-brand-navy">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-brand-navy">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your MindVisionTech content.</p>
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-200" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Courses"
            value={stats.totalCourses}
            icon={BookOpen}
            color="bg-brand-blue"
          />
          <StatCard
            label="Internship Tracks"
            value={stats.totalTracks}
            icon={GraduationCap}
            color="bg-brand-orange"
          />
          <StatCard
            label="PDF Materials"
            value={stats.totalPdfs}
            icon={FileText}
            color="bg-emerald-500"
          />
        </div>
      )}

      {/* Quick links */}
      <div className="mt-10">
        <h2 className="mb-4 text-sm font-black uppercase tracking-wider text-gray-400">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Manage Courses", href: "/admin/courses", icon: BookOpen },
            { label: "3-Day Materials", href: "/admin/internships/3-day", icon: GraduationCap },
            { label: "5-Day Materials", href: "/admin/internships/5-day", icon: GraduationCap },
            { label: "12-Day Materials", href: "/admin/internships/12-day", icon: GraduationCap },
          ].map(({ label, href, icon: Icon }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-gray-700 shadow-sm hover:border-brand-blue hover:text-brand-blue transition-all"
            >
              <Icon className="h-4 w-4 shrink-0 text-brand-orange" />
              {label}
              <TrendingUp className="ml-auto h-3.5 w-3.5 opacity-30" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
