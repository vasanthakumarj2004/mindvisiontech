import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Footer } from "@/components/Footer";
import { AssistantGreeter } from "@/components/AssistantGreeter";
import { VisionMission } from "@/components/VisionMission";

export const metadata: Metadata = {
  title: "About Us | MindVisionTech Innovation",
  description: "Learn the story behind MindVisionTech — our mission, our people, and why 5000+ engineers chose us to launch their careers.",
};

const stats = [
  { value: "5000+", label: "Students Placed" },
  { value: "200+",  label: "Hiring Partners" },
  { value: "25+",   label: "Branches Across India" },
  { value: "98%",   label: "Placement Rate" },
];

const values = [
  {
    icon: "⚙️",
    title: "Hands-On First",
    body: "Every concept is learned by doing. Lectures are short; labs are long. We believe real confidence comes from real circuits.",
  },
  {
    icon: "🤝",
    title: "Industry-Led",
    body: "Our curriculum is designed with hiring managers, not just academics. You learn what employers actually need on day one.",
  },
  {
    icon: "🚀",
    title: "Outcome Obsessed",
    body: "We track every placement and use the data to continuously improve. Your success is our report card.",
  },
  {
    icon: "🌐",
    title: "Community Driven",
    body: "25+ studios across India, thousands of alumni, and a network that stays active long after graduation.",
  },
];

type TeamMember = { name: string; role: string; img: string };
const team: TeamMember[] = [];

export default function AboutPage() {
  return (
    <main>
      {/* ── PAGE HERO — blue-deep ──────────────────────────────────────── */}
      <PageHero
        eyebrow="Our Story"
        heading="Built by engineers, for engineers."
        subheading="MindVisionTech was founded in 2014 with a single idea: practical skills beat passive knowledge every time. Today we are India's fastest-growing embedded systems training institute."
        aside={<AssistantGreeter />}
      />

      {/* ── VISION & MISSION — cream background ─────────────────────── */}
      <VisionMission />

      {/* ── STAT BAND — brand-blue ────────────────────────────────────── */}
      <section className="stat-band">
        <div className="shell stat-band__grid">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="stat-band__number">{stat.value}</p>
              <p className="stat-band__label">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION — white background ─────────────────────────────────── */}
      <section className="section shell" id="mission">
        <div className="grid gap-8 sm:gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow">Why we exist</p>
            <h2>
              Closing India&apos;s<br /><em>engineering skills gap.</em>
            </h2>
            <p className="mt-4 sm:mt-8 text-base sm:text-lg leading-relaxed text-brand-navy/75">
              There are hundreds of thousands of engineering graduates each year — but industry continuously reports that fewer than 20% are job-ready on day one. MindVisionTech exists to fix that.
            </p>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg leading-relaxed text-brand-navy/75">
              We partner directly with companies to understand what skills they need, build those into our curriculum, and then give students the practical time and mentorship needed to actually master them.
            </p>
            <Link
              href="/contact"
              className="button button--dark mt-6 sm:mt-8 inline-flex"
            >
              Start your journey ↗
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-blue-xl h-64 sm:h-[400px]">
            <Image
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=85"
              alt="MindVisionTech students collaborating in a hardware lab"
              width={700}
              height={500}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-blue-deep/50 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── VALUES — blue-wash background ─────────────────────────────── */}
      <section className="bg-brand-blue-wash py-12 sm:py-20 lg:py-24" id="values">
        <div className="shell">
          <p className="eyebrow">What we stand for</p>
          <h2 className="mb-10 sm:mb-16">
            Principles that<br /><em>guide everything.</em>
          </h2>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-brand-blue/12 bg-white p-5 sm:p-7 shadow-blue-sm transition-all hover:-translate-y-1 hover:shadow-blue-md"
              >
                <div className="mb-3 sm:mb-4 text-2xl sm:text-3xl">{value.icon}</div>
                <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold text-brand-navy">{value.title}</h3>
                <p className="text-sm sm:text-base leading-relaxed text-brand-navy/70">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM — white background ────────────────────────────────────── */}
      {team.length > 0 && (
        <section className="section shell" id="team">
          <p className="eyebrow">The people behind it</p>
          <h2 className="mb-10 sm:mb-16">
            Our<br /><em>leadership team.</em>
          </h2>
          <div className="grid gap-6 sm:gap-8 grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div key={member.name} className="group text-center">
                <div className="mx-auto mb-3 sm:mb-4 h-28 w-28 sm:h-36 sm:w-36 overflow-hidden rounded-full border-4 border-brand-blue-soft shadow-blue-md transition-all group-hover:border-brand-blue group-hover:shadow-blue-lg">
                  <Image
                    src={member.img}
                    alt={member.name}
                    width={144}
                    height={144}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-brand-navy">{member.name}</h3>
                <p className="text-xs sm:text-sm text-brand-navy/60">{member.role}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA BAND — blue-deep ──────────────────────────────────────── */}
      <section
        className="py-12 sm:py-20 text-center"
        style={{ backgroundColor: "#081d4a", color: "#ffffff" }}
      >
        <div className="shell">
          <p className="eyebrow" style={{ color: "#ef7e20", fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase" }}>
            Ready to join us?
          </p>
          <h2 style={{ color: "#ffffff", fontSize: "clamp(26px, 5vw, 48px)", fontWeight: 900, lineHeight: 1.1, margin: "12px 0 0" }}>
            Your career starts<br /><em style={{ color: "#ef7e20", fontStyle: "normal" }}>with one call.</em>
          </h2>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
            <Link href="/contact" className="button button--accent justify-center">Book a free counselling session ↗</Link>
            <Link href="/courses" className="button button--outline justify-center" style={{ borderColor: "rgba(255,255,255,0.4)", color: "#ffffff" }}>
              View all courses
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
