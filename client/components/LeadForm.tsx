"use client";

import { FormEvent, useState } from "react";
import { submitLead } from "@/lib/api";
import { companyInfo } from "@/data/company";

export function LeadForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = new FormData(event.currentTarget);
    const data = Object.fromEntries(form.entries()) as Record<string, string>;
    try {
      await submitLead(data);
      event.currentTarget.reset();
      setStatus("success");

      // ── Build WhatsApp deep-link with all enquiry details ──────────────
      const lines = [
        "📋 *New Enquiry — MindVisionTech Innovation*",
        "",
        `👤 *Name:* ${data.name || "—"}`,
        `📞 *Phone:* ${data.phone || "—"}`,
        `✉️ *Email:* ${data.email || "—"}`,
        `💬 *Message:* ${data.message?.trim() || "No message provided"}`,
        "",
        "_Submitted via the website enquiry form._",
      ];
      const message = encodeURIComponent(lines.join("\n"));
      window.open(
        `https://wa.me/${companyInfo.whatsapp}?text=${message}`,
        "_blank",
        "noopener,noreferrer"
      );
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="rounded-2xl sm:rounded-3xl border-2 border-brand-blue/15 bg-white p-5 sm:p-8 md:p-10 shadow-blue-xl">
      <div className="mb-5 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-black text-brand-navy">Send an Enquiry</h3>
        <p className="mt-1 text-xs font-semibold text-brand-navy/60">
          Takes 30 seconds · Our admissions team responds within 24 hours
        </p>
      </div>

      <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit} noValidate>
        {/* Name & Phone in 2-column grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="lead-name" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-brand-navy">
              Your Name <span className="text-brand-orange">*</span>
            </label>
            <input
              id="lead-name"
              name="name"
              required
              placeholder="e.g. Aarav Sharma"
              autoComplete="name"
              className="w-full rounded-xl border-2 border-brand-blue/20 bg-brand-blue-wash/40 px-3.5 py-3 text-base sm:text-sm font-semibold text-brand-navy placeholder:text-brand-navy/40 outline-none transition-all focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/15"
            />
          </div>
          <div>
            <label htmlFor="lead-phone" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-brand-navy">
              Phone Number <span className="text-brand-orange">*</span>
            </label>
            <input
              id="lead-phone"
              name="phone"
              type="tel"
              required
              placeholder="+91 98765 43210"
              autoComplete="tel"
              className="w-full rounded-xl border-2 border-brand-blue/20 bg-brand-blue-wash/40 px-3.5 py-3 text-base sm:text-sm font-semibold text-brand-navy placeholder:text-brand-navy/40 outline-none transition-all focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/15"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="lead-email" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-brand-navy">
            Email Address <span className="text-brand-orange">*</span>
          </label>
          <input
            id="lead-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-xl border-2 border-brand-blue/20 bg-brand-blue-wash/40 px-3.5 py-3 text-base sm:text-sm font-semibold text-brand-navy placeholder:text-brand-navy/40 outline-none transition-all focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/15"
          />
        </div>

        {/* Message / Course Interest */}
        <div>
          <label htmlFor="lead-message" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-brand-navy">
            What are you curious about?
          </label>
          <textarea
            id="lead-message"
            name="message"
            rows={3}
            placeholder="Tell us about the course or career path you want to pursue..."
            className="w-full rounded-xl border-2 border-brand-blue/20 bg-brand-blue-wash/40 px-3.5 py-3 text-base sm:text-sm font-semibold text-brand-navy placeholder:text-brand-navy/40 outline-none transition-all focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/15 resize-none"
          />
        </div>

        {/* Submit CTA */}
        <button
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange px-6 py-4 text-sm font-black uppercase tracking-wider text-white shadow-blue-md transition-all hover:-translate-y-0.5 hover:bg-[#d96a10] hover:shadow-blue-lg active:translate-y-0 disabled:opacity-70"
          disabled={status === "sending"}
          type="submit"
        >
          <span>{status === "sending" ? "Submitting..." : "Start a Conversation"}</span>
          <span className="text-xs">↗</span>
        </button>

        {status === "success" && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-bold text-emerald-800" role="status">
            ✓ Enquiry sent! WhatsApp has opened so you can confirm your details directly.
          </div>
        )}
        {status === "error" && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs font-bold text-rose-800" role="alert">
            Something went wrong. Please try again or call us directly at{" "}
            <a href={companyInfo.phoneHref} className="underline hover:text-rose-950">
              {companyInfo.phone}
            </a>.
          </div>
        )}
      </form>
    </div>
  );
}