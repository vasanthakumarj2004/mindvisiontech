"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Cpu, Wifi, Zap, Code2 } from "lucide-react";
import type { Course } from "@/lib/api";

/** Pick a lucide icon for the placeholder based on course name */
function PlaceholderIcon({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n.includes("embedded")) return <Cpu className="h-12 w-12 opacity-40" />;
  if (n.includes("iot") || n.includes("internet of things")) return <Wifi className="h-12 w-12 opacity-40" />;
  if (n.includes("electric") || n.includes("vehicle") || n.includes("ev")) return <Zap className="h-12 w-12 opacity-40" />;
  return <Code2 className="h-12 w-12 opacity-40" />;
}

export function CourseCard({ course, index }: { course: Course; index: number }) {
  const [imgError, setImgError] = useState(false);
  const showImage = !!course.image && !imgError;

  return (
    <article className="course-card group flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-blue-lg overflow-hidden">
      {/* ── Top image area ─────────────────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden rounded-t-2xl"
        style={{ aspectRatio: "16/9" }}
      >
        {showImage ? (
          <>
            <Image
              src={course.image!}
              alt={course.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
            {/* Gradient overlay fading to white at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent pointer-events-none" />
          </>
        ) : (
          /* Placeholder: icon centred on blue-wash block */
          <div className="flex h-full w-full items-center justify-center bg-[var(--blue-wash,#eef2ff)] text-brand-blue">
            <PlaceholderIcon name={course.name} />
          </div>
        )}
      </div>

      {/* ── Card body (unchanged) ───────────────────────────────────── */}
      <div className="mt-4">
        <div className="course-card__number font-black !text-amber-500">0{index + 1}</div>
        <p className="eyebrow" style={{ color: "#ef7e20" }}>
          {course.category || "Career track"}
        </p>
        <h3 className="text-xl font-black text-brand-navy">{course.name}</h3>
        <p className="muted mt-2 text-sm leading-relaxed">{course.description}</p>

        {/* Topic pill tags */}
        {course.topics && course.topics.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {course.topics.map((topic) => (
              <span
                key={topic}
                className="rounded-md border border-brand-blue/15 bg-brand-blue-wash px-2 py-0.5 text-[10px] font-bold text-brand-blue"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-brand-blue/10">
        <div className="course-card__meta mb-3 flex items-center text-xs font-bold">
          <span className="text-brand-navy/70">⏱ {course.duration}</span>
        </div>
        <Link
          className="text-link inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-brand-blue hover:text-brand-orange transition-colors"
          href={`/courses/${course.slug}`}
        >
          Explore course <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}