import type { ReactNode } from "react";
import { BranchLocator } from "@/components/BranchLocator";
import { CourseCard } from "@/components/CourseCard";
import { HeroBanner } from "@/components/HeroBanner";
import { InfiniteMarquee } from "@/components/InfiniteMarquee";
import { LeadForm } from "@/components/LeadForm";
import { Footer } from "@/components/Footer";
import { PlacementCard, type PlacementCardData } from "@/components/PlacementCard";
import { ServiceCard, type ServiceCardData } from "@/components/ServiceCard";
import { TickerBar } from "@/components/TickerBar";
import { WaveDivider } from "@/components/WaveDivider";
import { getBranches, getCourses, type Branch, type Course } from "@/lib/api";

import { companyInfo } from "@/data/company";
import { coursesData } from "@/data/courses";

const fallbackBranches: Branch[] = [
  {
    _id: "1",
    name: "Coimbatore Campus (HQ)",
    city: "Coimbatore",
    address: companyInfo.address.full,
    phone: companyInfo.phone,
  },
];

// ── Static page data ──────────────────────────────────────────────────────────
const services: ServiceCardData[] = [
  { title: "Python Full Stack",    imageUrl: "/images/services/python-full-stack.jpg" },
  { title: "Java Full Stack",      imageUrl: "/images/services/java-full-stack.jpg" },
  { title: ".NET Full Stack",      imageUrl: "/images/services/dotnet-full-stack.jpg" },
  { title: "VLSI Design",          imageUrl: "/images/services/vlsi-design.jpg" },
  { title: "Embedded Systems",     imageUrl: "/images/services/embedded-systems.jpg" },
  { title: "PCB Design",           imageUrl: "/images/services/pcb-design.jpg" },
];

const placements: PlacementCardData[] = [];

const tickerItems = [
  "CAREER SUPPORT",
  "TECHNICAL TRAINING",
  "AI INTEGRATED CAMPUS",
  "PRACTICAL CAREER SUPPORT",
  "INDUSTRY PROJECTS",
  "EXPERT MENTORSHIP",
];

async function loadData() {
  const [courses, branches] = await Promise.allSettled([getCourses(), getBranches()]);
  const coursesVal = courses.status === "fulfilled" && Array.isArray(courses.value) && courses.value.length > 0
    ? courses.value
    : coursesData;
  const branchesVal = branches.status === "fulfilled" && Array.isArray(branches.value) && branches.value.length > 0
    ? branches.value
    : fallbackBranches;

  return {
    courses: coursesVal,
    branches: branchesVal,
  };
}

// ── Reusable section heading block ────────────────────────────────────────────
function SectionHeading({ eyebrow, title, note }: { eyebrow: string; title: ReactNode; note: string }) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
          {eyebrow}
        </p>
        <h2>{title}</h2>
      </div>
      <p className="section-note">{note}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function Home() {
  const { courses, branches } = await loadData();

  return (
    <main id="top">
      {/* ── HERO (with TickerBar at bottom edge) ───────────────────────── */}
      <HeroBanner />

      {/* ── SERVICES — blue-wash background (60% blue-family) ────────────── */}
      <section className="bg-brand-blue-wash py-20" id="services">
        <div className="shell">
          <SectionHeading
            eyebrow="What we teach"
            title={<>Services that<br /><em>build capability.</em></>}
            note="Learn the tools, systems, and thinking that turn ambitious ideas into working technology."
          />
          <InfiniteMarquee
            items={services}
            speed={32}
            ariaLabel="MindVisionTech services"
            edgeFrom="from-brand-blue-wash"
          >
            {(service) => <ServiceCard {...service} />}
          </InfiniteMarquee>
        </div>
      </section>

      {/* ── WAVE DIVIDER — blue-wash → white ────────────────────────────── */}
      <WaveDivider topColor="#eef5ff" bottomColor="#ffffff" />

      {/* ── COURSES — white background ───────────────────────────────────── */}
      <section className="section shell" id="courses">
        <SectionHeading
          eyebrow="Choose your direction"
          title={<>Skills with<br /><em>momentum.</em></>}
          note="Industry-led courses, hands-on projects, internships, and placement support built around the work you want to do next."
        />
        <div className="course-grid">
          {courses.map((course, index) => (
            <CourseCard course={course} index={index} key={course._id} />
          ))}
        </div>
      </section>

      {/* ── CAMPUSES — blue-soft background (60% blue-family) ────────────── */}
      <section className="campus-band" id="campuses">
        <div className="shell campus-layout">
          <div>
            <p className="eyebrow">Find your people</p>
            <h2>
              Good work needs<br />
              <em>good company.</em>
            </h2>
            <p className="campus-copy">
              Drop in for a conversation, stay for the community. Our studios are designed for focused learning and unexpected collaborations.
            </p>
          </div>
          <BranchLocator branches={branches} />
        </div>
      </section>

      {/* ── PLACEMENTS — blue-wash background ───────────────────────────── */}
      {placements.length > 0 && (
        <section className="bg-brand-blue-wash py-24" id="placements">
          <div className="shell">
            <SectionHeading
              eyebrow="Real outcomes"
              title={<>Success worth<br /><em>celebrating.</em></>}
              note="Our placement team stays with students from first portfolio review to first day at work."
            />
            <InfiniteMarquee
              items={placements}
              speed={55}
              direction="right"
              ariaLabel="MindVisionTech placement success stories"
              edgeFrom="from-brand-blue-wash"
            >
              {(placement) => <PlacementCard {...placement} />}
            </InfiniteMarquee>
          </div>
        </section>
      )}

      {/* ── ENQUIRE — blue-deep background (dark CTA section) ────────────── */}
      <section className="bg-brand-blue-deep py-12" id="enquire" style={{ backgroundColor: "#081d4a", color: "#ffffff" }}>
        <div className="shell enquire">
          <div className="enquire-title">
            <p className="eyebrow" style={{ color: "#facc15", fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase" }}>✦ No hard sell</p>
            <h2 style={{ color: "#ffffff", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 900, lineHeight: 1.1 }}>
              Start with a<br />
              <em style={{ color: "#facc15", fontStyle: "normal" }}>question.</em>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "16px", lineHeight: 1.5 }}>
              Tell us what you are figuring out. We will help you find the right next step.
            </p>
          </div>
          <LeadForm />
        </div>
      </section>

      {/* ── SHARED FOOTER ────────────────────────────────────────────────── */}
      <Footer />
    </main>
  );
}
