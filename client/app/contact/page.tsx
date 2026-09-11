import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Footer } from "@/components/Footer";
import { LeadForm } from "@/components/LeadForm";
import { companyInfo } from "@/data/company";
import { getBranches, type Branch } from "@/lib/api";

export const metadata: Metadata = {
  title: `Contact Us | ${companyInfo.name}`,
  description: `Get in touch with ${companyInfo.name} — book a free counselling session, visit our campus at ${companyInfo.address.full}, or call ${companyInfo.phone}.`,
};

const fallbackBranches: Branch[] = [
  { _id: "1", name: "Coimbatore Campus (HQ)", city: "Coimbatore", address: companyInfo.address.full, phone: companyInfo.phone },
];

const socialLinks = [
  { label: "LinkedIn",  href: "https://linkedin.com",  icon: "in" },
  { label: "YouTube",   href: "https://youtube.com",   icon: "▶" },
  { label: "Instagram", href: "https://instagram.com", icon: "◉" },
  { label: "Twitter",   href: "https://twitter.com",   icon: "𝕏" },
];

async function loadBranches(): Promise<Branch[]> {
  try {
    const branches = await getBranches();
    return branches.length ? branches : fallbackBranches;
  } catch {
    return fallbackBranches;
  }
}

export default async function ContactPage() {
  const branches = await loadBranches();

  return (
    <main>
      {/* ── PAGE HERO — blue-deep ──────────────────────────────────────── */}
      <PageHero
        eyebrow="Get in touch"
        heading="No hard sell. Just a conversation."
        subheading="Tell us where you are and where you want to go. Our admissions team responds within 24 hours."
      />

      {/* ── FORM + BRANCH INFO — white background ─────────────────────── */}
      <section className="section" id="enquire">
        <div className="shell grid gap-8 sm:gap-16 lg:grid-cols-[1fr_1.2fr] lg:items-start">

          {/* Left — contact info */}
          <div>
            <p className="eyebrow">Reach us directly</p>
            <h2 className="mb-6 sm:mb-8">
              We are here<br /><em>to help.</em>
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-brand-navy/70 mb-6 sm:mb-8">
              Whether you have a specific course in mind or are still figuring out your direction, we will help you make the right call — literally.
            </p>

            {/* Email + phone + address callouts */}
            <div className="mb-8 sm:mb-10 space-y-3 sm:space-y-4">
              {/* Phone */}
              <div className="flex items-center gap-3.5 sm:gap-4 rounded-xl sm:rounded-2xl border border-brand-blue/12 bg-brand-blue-wash p-3.5 sm:p-4">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white text-xs sm:text-sm font-bold shadow-sm">
                  ☎
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-blue">Phone</p>
                  <a href={companyInfo.phoneHref} className="text-sm sm:text-base font-extrabold text-brand-navy hover:text-brand-orange transition-colors">
                    {companyInfo.phone}
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3.5 sm:gap-4 rounded-xl sm:rounded-2xl border border-brand-blue/12 bg-brand-blue-wash p-3.5 sm:p-4">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white text-xs sm:text-sm font-bold shadow-sm">
                  ✉
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-blue">Email</p>
                  <a href={companyInfo.emailHref} className="text-xs sm:text-base font-extrabold text-brand-navy hover:text-brand-orange transition-colors break-all">
                    {companyInfo.email}
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3.5 sm:gap-4 rounded-xl sm:rounded-2xl border border-brand-blue/12 bg-brand-blue-wash p-3.5 sm:p-4">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white text-xs sm:text-sm font-bold shadow-sm mt-0.5">
                  📍
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-blue">Headquarters</p>
                  <p className="text-xs sm:text-sm font-semibold text-brand-navy mt-0.5 leading-relaxed">
                    {companyInfo.address.full}
                  </p>
                </div>
              </div>
            </div>

            {/* Social links */}
            <p className="eyebrow mb-3 sm:mb-4">Follow us</p>
            <div className="flex gap-2.5 sm:gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-brand-blue/25 bg-brand-blue-wash text-xs sm:text-sm font-bold text-brand-blue transition-all hover:bg-brand-blue hover:text-white hover:border-brand-blue hover:shadow-blue-sm"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Right — lead form */}
          <div>
            <LeadForm />
          </div>
        </div>
      </section>

      {/* ── BRANCHES — blue-wash background ───────────────────────────── */}
      <section className="bg-brand-blue-wash py-12 sm:py-20" id="branches">
        <div className="shell">
          <p className="eyebrow">Find a studio near you</p>
          <h2 className="mb-8 sm:mb-14">
            Our<br /><em>campus locations.</em>
          </h2>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {branches.map((branch) => (
              <div
                key={branch._id}
                className="rounded-2xl border border-brand-blue/15 bg-white p-5 sm:p-6 shadow-blue-sm transition-all hover:-translate-y-1 hover:shadow-blue-md"
              >
                <p className="eyebrow mb-2 sm:mb-3">{branch.city}</p>
                <h3 className="mb-2 text-lg sm:text-xl font-bold text-brand-navy">{branch.name}</h3>
                <p className="mb-4 text-xs sm:text-sm leading-relaxed text-brand-navy/65">{branch.address}</p>
                <a
                  href={`tel:${branch.phone}`}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-brand-blue hover:text-brand-orange transition-colors"
                >
                  ☎ {branch.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EMBEDDED GOOGLE MAP — Headquarters ───────────────────────── */}
      <section className="bg-brand-blue-wash py-8 sm:py-12" aria-label="Campus location map">
        <div className="shell">
          <div className="mb-4 sm:mb-6">
            <p className="eyebrow">Visit our Campus</p>
            <h2>Find us on <em>the map.</em></h2>
          </div>
          <div className="overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-brand-blue/15 shadow-blue-lg h-64 sm:h-96 w-full">
            <iframe
              title="MindVisionTech Innovation Location Map"
              src="https://maps.google.com/maps?q=56,%20472,%20Marudhamalai%20Road,%20P%20N%20Pudur,%20Coimbatore,%20Tamil%20Nadu%20641041&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="h-full w-full border-0"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* ── FAQ — white background ────────────────────────────────────── */}
      <section className="section shell" id="faq">
        <p className="eyebrow">Common questions</p>
        <h2 className="mb-14">
          Things people<br /><em>often ask us.</em>
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            { q: "Do I need prior experience to enroll?", a: "No. Most of our programmes start from the fundamentals and are designed for recent graduates or career-changers with a basic science or engineering background." },
            { q: "How long does placement support last?", a: "We provide active placement support for 12 months after course completion. Alumni also have lifetime access to our hiring network and job board." },
            { q: "Are there EMI / instalment options?", a: "Yes. We offer 3–12 month no-cost EMI plans in partnership with major banks. Financing details are shared during your counselling call." },
            { q: "Can I visit a campus before enrolling?", a: "Absolutely — we encourage it. Book a studio visit and you will meet faculty, see the labs, and speak with current students." },
          ].map(({ q, a }) => (
            <div
              key={q}
              className="rounded-2xl border border-brand-blue/12 bg-brand-blue-wash p-6 shadow-blue-sm transition-all hover:shadow-blue-md"
            >
              <h3 className="mb-3 text-lg font-bold text-brand-navy">{q}</h3>
              <p className="text-base leading-relaxed text-brand-navy/70">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
