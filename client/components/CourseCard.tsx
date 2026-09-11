"use client";

import Link from "next/link";
import type { Course } from "@/lib/api";

export function CourseCard({ course, index }: { course: Course; index: number }) {
  return (
    <article className="course-card group flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-blue-lg">
      <div>
        <div className="course-card__number">0{index + 1}</div>
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
        <div className="course-card__meta mb-3 flex items-center justify-between text-xs font-bold">
          <span className="text-brand-navy/70">⏱ {course.duration}</span>
          <span className="text-brand-blue">{course.fees ? `From ₹${course.fees.toLocaleString("en-IN")}` : "Talk to us"}</span>
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