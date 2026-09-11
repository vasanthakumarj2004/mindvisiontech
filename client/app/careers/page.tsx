import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { Footer } from "@/components/Footer";
import { PlacementCard, type PlacementCardData } from "@/components/PlacementCard";
import { InfiniteMarquee } from "@/components/InfiniteMarquee";

export const metadata: Metadata = {
  title: "Careers & Placements | MindVisionTech Innovation",
  description: "Explore our placement record, top hiring partners, average salary packages, and career transformation stories.",
};

const placementsTop: PlacementCardData[] = [
  { studentName: "Aarav Sharma",   companyName: "TechNova",   companyLogoUrl: "https://dummyimage.com/180x60/ffffff/0b2b6b&text=TechNova",    role: "Embedded Engineer",    salary: "₹6.5 LPA", photoUrl: "https://i.pravatar.cc/160?img=12", phone: "MV-2026-01" },
  { studentName: "Priya Menon",    companyName: "InnoSoft",   companyLogoUrl: "https://dummyimage.com/180x60/ffffff/0b2b6b&text=InnoSoft",    role: "Full Stack Developer", salary: "₹8.2 LPA", photoUrl: "https://i.pravatar.cc/160?img=47", phone: "MV-2026-02" },
  { studentName: "Rahul Verma",    companyName: "Apex Labs",  companyLogoUrl: "https://dummyimage.com/180x60/ffffff/0b2b6b&text=Apex+Labs",   role: "Automation Engineer",  salary: "₹5.8 LPA", photoUrl: "https://i.pravatar.cc/160?img=11", phone: "MV-2026-03" },
  { studentName: "Meera Nair",     companyName: "BrightWorks",companyLogoUrl: "https://dummyimage.com/180x60/ffffff/0b2b6b&text=BrightWorks", role: "Data Analyst",         salary: "₹7.1 LPA", photoUrl: "https://i.pravatar.cc/160?img=32", phone: "MV-2026-04" },
];

const placementsBottom: PlacementCardData[] = [
  { studentName: "Karthik Raja",   companyName: "Bosch India",companyLogoUrl: "https://dummyimage.com/180x60/ffffff/0b2b6b&text=Bosch",       role: "VLSI Verification",    salary: "₹9.5 LPA", photoUrl: "https://i.pravatar.cc/160?img=60", phone: "MV-2026-05" },
  { studentName: "Divya Reddy",    companyName: "Qualcomm",   companyLogoUrl: "https://dummyimage.com/180x60/ffffff/0b2b6b&text=Qualcomm",    role: "Firmware Engineer",    salary: "₹11.0 LPA",photoUrl: "https://i.pravatar.cc/160?img=26", phone: "MV-2026-06" },
  { studentName: "Sanjay Patel",   companyName: "L&T Tech",   companyLogoUrl: "https://dummyimage.com/180x60/ffffff/0b2b6b&text=L%26T+TS",   role: "PCB Layout Engineer",  salary: "₹6.2 LPA", photoUrl: "https://i.pravatar.cc/160?img=15", phone: "MV-2026-07" },
  { studentName: "Ananya Roy",     companyName: "Texas Inst.",companyLogoUrl: "https://dummyimage.com/180x60/ffffff/0b2b6b&text=TI+India",    role: "Embedded Systems Eng", salary: "₹10.5 LPA",photoUrl: "https://i.pravatar.cc/160?img=44", phone: "MV-2026-08" },
];

const partners = [
  "Qualcomm", "Bosch", "Texas Instruments", "L&T Technology Services", "Microchip",
  "TATA Elxsi", "HCL Tech", "Wipro VLSI", "Infineon Technologies", "STMicroelectronics",
  "NXP Semiconductors", "Cyient"
];

const processSteps = [
  { step: "01", title: "Technical Foundation", desc: "4-6 months of practical, hands-on lab training with real hardware platforms." },
  { step: "02", title: "Capstone Projects",     desc: "Build industry-ready projects reviewed directly by senior hardware architects." },
  { step: "03", title: "Resume & Mock Drives", desc: "Rigorous technical mock interviews, resume refinement, and GitHub portfolio reviews." },
  { step: "04", title: "Exclusive Hiring Drives",desc: "Direct interview scheduling with 200+ partner companies until final offer onboarding." },
];

export default function CareersPage() {
  return (
    <main>
      {/* ── PAGE HERO — blue-deep ──────────────────────────────────────── */}
      <PageHero
        eyebrow="Placement Outcomes"
        heading="5,000+ success stories and counting."
        subheading="Our placement cell doesn't just forward resumes. We prepare you until you crack the technical round."
      />

      {/* ── PLACEMENT MARQUEE — dual directional ──────────────────────── */}
      <section className="bg-brand-blue-wash py-12 sm:py-20 overflow-hidden" id="stories">
        <div className="shell mb-6 sm:mb-10">
          <p className="eyebrow">Recent Placements</p>
          <h2>
            Meet the graduates<br /><em>making an impact.</em>
          </h2>
        </div>

        {/* Row 1 — left */}
        <div className="mb-4 sm:mb-6">
          <InfiniteMarquee items={placementsTop} speed={26} direction="left" edgeFrom="from-brand-blue-wash">
            {(p) => <PlacementCard {...p} />}
          </InfiniteMarquee>
        </div>

        {/* Row 2 — right */}
        <div>
          <InfiniteMarquee items={placementsBottom} speed={30} direction="right" edgeFrom="from-brand-blue-wash">
            {(p) => <PlacementCard {...p} />}
          </InfiniteMarquee>
        </div>
      </section>

      {/* ── PLACEMENT PROCESS — white background ──────────────────────── */}
      <section className="section shell" id="process">
        <p className="eyebrow">How we place you</p>
        <h2 className="mb-10 sm:mb-16">
          The 4-step placement<br /><em>blueprint.</em>
        </h2>
        <div className="grid gap-4 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((s) => (
            <div
              key={s.step}
              className="rounded-2xl sm:rounded-3xl border border-brand-blue/15 bg-brand-blue-wash p-5 sm:p-8 shadow-blue-sm transition-all hover:-translate-y-1 hover:shadow-blue-md"
            >
              <span className="mb-4 sm:mb-6 inline-block text-3xl sm:text-4xl font-black text-brand-orange">{s.step}</span>
              <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold text-brand-navy">{s.title}</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-brand-navy/70">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HIRING PARTNERS GRID — blue-soft background ───────────────── */}
      <section className="bg-brand-blue-soft py-12 sm:py-20" id="partners">
        <div className="shell text-center">
          <p className="eyebrow">Our Network</p>
          <h2 className="mb-8 sm:mb-14">
            Where MindVisionTech<br /><em>alumni work.</em>
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {partners.map((partner) => (
              <div
                key={partner}
                className="flex items-center justify-center rounded-xl sm:rounded-2xl border border-brand-blue/15 bg-white p-3.5 sm:p-6 shadow-blue-sm font-extrabold text-xs sm:text-base text-brand-navy hover:text-brand-blue hover:border-brand-blue transition-all text-center leading-snug"
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STAT BAND — brand-blue ────────────────────────────────────── */}
      <section className="stat-band">
        <div className="shell stat-band__grid">
          <div><p className="stat-band__number">₹7.2 LPA</p><p className="stat-band__label">Average Package</p></div>
          <div><p className="stat-band__number">₹16.5 LPA</p><p className="stat-band__label">Highest Package</p></div>
          <div><p className="stat-band__number">200+</p><p className="stat-band__label">Hiring Companies</p></div>
          <div><p className="stat-band__number">100%</p><p className="stat-band__label">Placement Support</p></div>
        </div>
      </section>

      {/* ── CTA BAND — blue-deep ──────────────────────────────────────── */}
      <section
        className="py-12 sm:py-20 text-center"
        style={{ backgroundColor: "#081d4a", color: "#ffffff" }}
      >
        <div className="shell">
          <p className="eyebrow" style={{ color: "#ef7e20", fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase" }}>
            Ready for your breakthrough?
          </p>
          <h2 style={{ color: "#ffffff", fontSize: "clamp(26px, 5vw, 48px)", fontWeight: 900, lineHeight: 1.1, margin: "12px 0 0" }}>
            Get placed in top<br /><em style={{ color: "#ef7e20", fontStyle: "normal" }}>core engineering companies.</em>
          </h2>
          <div className="mt-8 flex justify-center">
            <Link href="/contact" className="button button--accent">Book placement counselling call ↗</Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
