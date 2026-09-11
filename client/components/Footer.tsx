import Image from "next/image";
import Link from "next/link";
import { companyInfo, socialLinks } from "@/data/company";

export function Footer() {
  return (
    <footer
      className="border-t border-white/10 py-16 text-white"
      style={{ backgroundColor: "#081d4a", color: "#ffffff" }}
    >
      <div className="shell grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Col 1: Brand */}
        <div className="space-y-4">
          <Link href="/" className="inline-block" aria-label="MindVisionTech home">
            <Image
              src="/mindvisiontech-logo.svg"
              alt={companyInfo.name}
              width={180}
              height={44}
              className="h-auto w-40 brightness-0 invert"
            />
          </Link>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255, 255, 255, 0.70)" }}>
            India&apos;s leading embedded systems, VLSI, and AI engineering institute. Hands-on labs, 100% placement support.
          </p>

          {/* Social Links */}
          <div className="pt-2">
            <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-white/60">Follow Us</h4>
            <div className="flex items-center gap-3">
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-all hover:border-[#ef7e20] hover:bg-[#ef7e20] hover:scale-110"
                  title="Follow us on Instagram"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: "#ef7e20" }}>
            Navigation
          </h3>
          <ul className="space-y-2.5 text-sm font-medium">
            <li><Link href="/" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.85)" }}>Home</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.85)" }}>About Us</Link></li>
            <li><Link href="/services" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.85)" }}>Services</Link></li>
            <li><Link href="/courses" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.85)" }}>All Courses</Link></li>
            <li><Link href="/careers" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.85)" }}>Careers & Placements</Link></li>
          </ul>
        </div>

        {/* Col 3: Resources & Contact */}
        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: "#ef7e20" }}>
            Resources
          </h3>
          <ul className="space-y-2.5 text-sm font-medium">
            <li><Link href="/blogs" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.85)" }}>Blog & Guides</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.85)" }}>Contact Us</Link></li>
            <li><Link href="/contact#branches" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.85)" }}>Campus Locations</Link></li>
            <li><Link href="/contact#faq" className="hover:text-white transition-colors" style={{ color: "rgba(255, 255, 255, 0.85)" }}>FAQs</Link></li>
          </ul>
        </div>

        {/* Col 4: Reach Us */}
        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: "#ef7e20" }}>
            Contact
          </h3>
          <ul className="space-y-3.5 text-sm">
            <li>
              <a
                href={companyInfo.phoneHref}
                className="group flex items-center gap-3 transition-colors hover:text-white"
                style={{ color: "rgba(255, 255, 255, 0.85)" }}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs shadow-sm transition-transform group-hover:scale-110"
                  style={{ backgroundColor: "#ef7e20" }}
                >
                  ☎
                </span>
                <span className="font-semibold">{companyInfo.phone}</span>
              </a>
            </li>
            <li>
              <a
                href={companyInfo.emailHref}
                className="group flex items-center gap-3 transition-colors hover:text-white break-all"
                style={{ color: "rgba(255, 255, 255, 0.85)" }}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs shadow-sm transition-transform group-hover:scale-110"
                  style={{ backgroundColor: "#ef7e20" }}
                >
                  ✉
                </span>
                <span className="font-medium text-xs sm:text-sm">{companyInfo.email}</span>
              </a>
            </li>
            <li>
              <div className="flex items-start gap-3">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs shadow-sm mt-0.5"
                  style={{ backgroundColor: "#ef7e20" }}
                >
                  📍
                </span>
                <span className="text-xs leading-relaxed" style={{ color: "rgba(255, 255, 255, 0.75)" }}>
                  {companyInfo.address.full}
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="shell mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ color: "rgba(255, 255, 255, 0.60)" }}>
        <span>© 2026 {companyInfo.name}. All rights reserved.</span>
        <span>{companyInfo.tagline}.</span>
      </div>
    </footer>
  );
}
