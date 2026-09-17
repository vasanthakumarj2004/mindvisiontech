import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { Footer } from "@/components/Footer";
import { BlogNewsletter } from "@/components/BlogNewsletter";
import { BlogFilterList } from "@/components/BlogFilterList";

export const metadata: Metadata = {
  title: "Blog | MindVisionTech Innovation",
  description: "Insights, guides, and career advice from the MindVisionTech team — covering embedded systems, AI, PCB design, robotics, and industry trends.",
};

export default function BlogsPage() {
  return (
    <main>
      {/* ── PAGE HERO — blue-deep ──────────────────────────────────────── */}
      <PageHero
        eyebrow="Insights & Guides"
        heading="The MindVisionTech blog."
        subheading="Career advice, technical deep-dives, and industry perspectives from our instructors and alumni."
      />

      {/* ── INTERACTIVE CATEGORY FILTER & ARTICLES ────────────────────── */}
      <Suspense fallback={<div className="shell py-12 text-center text-sm font-bold text-brand-navy/60">Loading articles...</div>}>
        <BlogFilterList />
      </Suspense>

      {/* ── NEWSLETTER — blue-deep ────────────────────────────────────── */}
      <section
        className="py-12 sm:py-20 text-center"
        style={{ backgroundColor: "#081d4a", color: "#ffffff" }}
      >
        <div className="shell max-w-xl mx-auto">
          <p className="eyebrow" style={{ color: "#ef7e20", fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase" }}>
            Stay sharp
          </p>
          <h2 style={{ color: "#ffffff", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 900, lineHeight: 1.1, margin: "12px 0 0" }}>
            Get articles like these<br /><em style={{ color: "#ef7e20", fontStyle: "normal" }}>in your inbox.</em>
          </h2>
          <p className="mt-4 text-base" style={{ color: "rgba(255,255,255,0.85)" }}>
            One email per week. Technical depth. No spam.
          </p>
          <BlogNewsletter />
        </div>
      </section>

      <Footer />
    </main>
  );
}
