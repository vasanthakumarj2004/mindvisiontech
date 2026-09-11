import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { CourseCard } from "@/components/CourseCard";
import { Footer } from "@/components/Footer";
import { getCourses, type Course } from "@/lib/api";

export const metadata: Metadata = {
  title: "All Courses | MindVisionTech Innovation",
  description: "Browse all industry-oriented engineering courses at MindVisionTech — Embedded Systems, VLSI, PCB Design, Robotics, and Full Stack Development.",
};

import { coursesData } from "@/data/courses";

async function loadCourses(): Promise<Course[]> {
  try {
    const courses = await getCourses();
    return Array.isArray(courses) && courses.length > 0 ? courses : coursesData;
  } catch {
    return coursesData;
  }
}

export default async function CoursesPage() {
  const courses = await loadCourses();

  return (
    <main>
      {/* ── PAGE HERO — blue-deep ──────────────────────────────────────── */}
      <PageHero
        eyebrow="Curriculum & Programs"
        heading="Skills engineered for hiring requirements."
        subheading="Compare our career-focused courses, view detailed module breakdowns, and select the right track for your goals."
        aside={
          <div className="rounded-2xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur-md">
            <span className="block text-4xl font-black text-brand-orange">{courses.length}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-white/80">Active Cohorts</span>
          </div>
        }
      />

      {/* ── COURSES GRID — blue-wash background ──────────────────────── */}
      <section className="bg-brand-blue-wash py-12 sm:py-20 lg:py-24" id="all-courses">
        <div className="shell">
          <p className="eyebrow">Explore options</p>
          <h2 className="mb-8 sm:mb-14">
            Find the program<br /><em>that fits your career.</em>
          </h2>
          <div className="course-grid">
            {courses.map((course, index) => (
              <CourseCard course={course} index={index} key={course._id} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND — blue-deep ──────────────────────────────────────── */}
      <section
        className="py-12 sm:py-20 text-center"
        style={{ backgroundColor: "#081d4a", color: "#ffffff" }}
      >
        <div className="shell">
          <p className="eyebrow" style={{ color: "#ef7e20", fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase" }}>
            Not sure which course is right for you?
          </p>
          <h2 style={{ color: "#ffffff", fontSize: "clamp(26px, 5vw, 48px)", fontWeight: 900, lineHeight: 1.1, margin: "12px 0 0" }}>
            Get personalized career guidance<br /><em style={{ color: "#ef7e20", fontStyle: "normal" }}>from our counselors.</em>
          </h2>
          <div className="mt-8 flex justify-center">
            <Link href="/contact" className="button button--accent">Book a free 1-on-1 session ↗</Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
