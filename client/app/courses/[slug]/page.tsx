import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { Footer } from "@/components/Footer";
import { LeadForm } from "@/components/LeadForm";
import { getCourseBySlug, fallbackCourses } from "@/lib/course";

export function generateStaticParams() {
  return fallbackCourses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Course Not Found | MindVisionTech" };
  return {
    title: `${course.name} | MindVisionTech Courses`,
    description: course.description,
  };
}
export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  return (
    <main>
      {/* ── PAGE HERO — blue-deep ──────────────────────────────────────── */}
      <PageHero
        eyebrow="Course Detail"
        heading={course.name}
        subheading={course.description}
        aside={
          <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-md text-white text-center space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest text-brand-orange">Course Fee</div>
            <div className="text-3xl font-black">₹{course.fees.toLocaleString("en-IN")}</div>
            <div className="text-xs text-white/70">Flexible No-Cost EMI Available</div>
          </div>
        }
      />

      {/* ── COURSE OVERVIEW — white background ───────────────────────── */}
      <section className="section shell">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.45fr] lg:gap-12">
          <div>
            <p className="eyebrow">Program Structure</p>
            <h2 className="mb-6 sm:mb-8">
              What you will master in<br /><em>{course.duration}.</em>
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-brand-navy/75 mb-6 sm:mb-8">
              This intensive program is designed for engineers seeking hands-on mastery. You will complete real-world projects, write clean code/RTL, build hardware prototypes, and prepare for industry placement drives.
            </p>

            {/* Key highlights pill grid */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2 mb-8 sm:mb-10">
              {[
                { title: "Duration", val: course.duration },
                { title: "Mode", val: "In-Person Labs & Online" },
                { title: "Projects", val: "4 Capstone Projects" },
                { title: "Support", val: "100% Placement Drives" },
              ].map((item) => (
                <div key={item.title} className="rounded-xl sm:rounded-2xl border border-brand-blue/15 bg-brand-blue-wash p-3.5 sm:p-4">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-blue">{item.title}</p>
                  <p className="text-sm sm:text-lg font-bold text-brand-navy mt-0.5 sm:mt-1">{item.val}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href="#enquire-course" className="button button--accent justify-center">
                Enquire for next batch ↗
              </Link>
              <Link href="/courses" className="button button--dark justify-center">
                ← Back to all courses
              </Link>
            </div>
          </div>

          {/* Sidebar callout */}
          <div className="rounded-2xl sm:rounded-3xl border border-brand-blue/15 bg-brand-blue-wash p-5 sm:p-8 shadow-blue-md self-start space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-bold text-brand-navy">Why Choose MindVisionTech?</h3>
            <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-brand-navy/80 font-medium">
              <li className="flex items-center gap-2.5">
                <span className="text-brand-blue font-bold">✓</span> Industry-standard lab kits provided
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-brand-blue font-bold">✓</span> 1-on-1 code reviews with mentors
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-brand-blue font-bold">✓</span> Mock interview sessions
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-brand-blue font-bold">✓</span> Direct corporate referral portal
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── ENQUIRE SECTION — blue-deep ──────────────────────────────── */}
      <section className="bg-brand-blue-deep py-12 sm:py-20 text-white" id="enquire-course">
        <div className="shell grid gap-8 sm:gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow" style={{ color: "#ef7e20" }}>Seats are limited</p>
            <h2 style={{ color: "#ffffff", fontSize: "clamp(26px, 5vw, 48px)" }}>
              Reserve your spot in<br /><em style={{ color: "#ef7e20" }}>the upcoming batch.</em>
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
              Submit your enquiry below and an admissions advisor will get back to you with batch schedules and fee payment options within 24 hours.
            </p>
          </div>
          <div>
            <LeadForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}