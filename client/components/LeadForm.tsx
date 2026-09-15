"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { submitLead } from "@/lib/api";
import { companyInfo } from "@/data/company";

interface FormValues {
  name: string;
  phone: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
}

export function LeadForm() {
  const [values, setValues] = useState<FormValues>({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [whatsappLink, setWhatsappLink] = useState<string>("");

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));

    // Clear inline error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function validate(fields: FormValues): FormErrors {
    const errs: FormErrors = {};

    // 1. Name validation
    const trimmedName = fields.name.trim();
    if (!trimmedName) {
      errs.name = "Please enter your name.";
    } else if (trimmedName.length < 2) {
      errs.name = "Name must be at least 2 characters long.";
    }

    // 2. Phone validation (supports 10 digits with optional +91 or standard international prefixes)
    const rawPhone = fields.phone.replace(/[\s\-()]/g, "");
    const phoneDigits = rawPhone.replace(/^\+/, "");
    if (!fields.phone.trim()) {
      errs.phone = "Please enter your phone number.";
    } else if (!/^\+?[0-9]{10,15}$/.test(rawPhone) || phoneDigits.length < 10) {
      errs.phone = "Please enter a valid 10-digit mobile number.";
    }

    // 3. Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!fields.email.trim()) {
      errs.email = "Please enter your email address.";
    } else if (!emailRegex.test(fields.email.trim())) {
      errs.email = "Please enter a valid email address (e.g. name@example.com).";
    }

    return errs;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus("submitting");

    // ── 1. Construct Structured WhatsApp Message ────────────────────────────
    const enquiryLines = [
      "📋 *New Admission Enquiry — MindVisionTech Innovation*",
      "──────────────────────────────",
      `👤 *Name:* ${values.name.trim()}`,
      `📞 *Phone:* ${values.phone.trim()}`,
      `✉️ *Email:* ${values.email.trim()}`,
      `💬 *Interested In:* ${values.message.trim() || "Course information & career counselling"}`,
      "──────────────────────────────",
      "_Submitted via the MindVisionTech website enquiry form._",
    ];

    const encodedMessage = encodeURIComponent(enquiryLines.join("\n"));
    const waUrl = `https://wa.me/${companyInfo.whatsapp}?text=${encodedMessage}`;
    setWhatsappLink(waUrl);

    // ── 2. Non-blocking Web3Forms Email Delivery (if key configured) ────────
    const web3formsKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
    if (web3formsKey) {
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: web3formsKey,
          subject: `New Website Enquiry from ${values.name.trim()}`,
          from_name: "MindVisionTech Website",
          name: values.name.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
          message: values.message.trim() || "No message provided",
        }),
      }).catch(() => {
        // Silently ignore email failures so user flow is never disrupted
      });
    }

    // ── 3. Non-blocking MongoDB/Express Backend Save (as a bonus) ───────────
    submitLead({
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      message: values.message.trim(),
    }).catch(() => {
      // Backend CORS/connection issues are safely ignored without breaking user experience
    });

    // ── 4. Open WhatsApp directly in new tab ─────────────────────────────────
    try {
      window.open(waUrl, "_blank", "noopener,noreferrer");
    } catch {
      // Handled gracefully by the "Open in WhatsApp" button on the success screen
    }

    setStatus("success");
  }

  function handleReset() {
    setValues({ name: "", phone: "", email: "", message: "" });
    setErrors({});
    setStatus("idle");
    setWhatsappLink("");
  }

  // ── Success State Screen ────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="rounded-2xl sm:rounded-3xl border-2 border-brand-blue/15 bg-white p-6 sm:p-8 md:p-10 shadow-blue-xl text-center">
        {/* Checkmark Badge */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-black text-emerald-600 shadow-xs">
          ✓
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-brand-navy">
          Thank you, {values.name.split(" ")[0]}!
        </h3>

        <p className="mt-2 text-sm sm:text-base leading-relaxed text-brand-navy/80">
          Your enquiry has been prepared. WhatsApp should open automatically with your details ready to send.
        </p>

        {/* Action Button: Direct WhatsApp link fallback */}
        <div className="mt-6 space-y-3">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-4 text-sm font-black uppercase tracking-wider text-white shadow-blue-md transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-blue-lg active:translate-y-0"
          >
            <span>Open in WhatsApp</span>
            <span className="text-base">↗</span>
          </a>

          <p className="text-xs text-brand-navy/60">
            If WhatsApp didn&apos;t open automatically, click the button above to chat directly with our admissions counselor.
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-brand-blue/15 bg-brand-blue-wash/60 p-4 text-left text-xs sm:text-sm text-brand-navy/80 space-y-1">
          <p className="font-bold text-brand-navy">Enquiry Summary:</p>
          <p><span className="font-semibold text-brand-navy/60">Phone:</span> {values.phone}</p>
          <p><span className="font-semibold text-brand-navy/60">Email:</span> {values.email}</p>
          {values.message && (
            <p><span className="font-semibold text-brand-navy/60">Note:</span> {values.message}</p>
          )}
        </div>

        <button
          onClick={handleReset}
          type="button"
          className="mt-6 text-xs font-bold uppercase tracking-wider text-brand-orange hover:underline cursor-pointer"
        >
          ← Send another enquiry
        </button>
      </div>
    );
  }

  // ── Default Form Screen ─────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl sm:rounded-3xl border-2 border-brand-blue/15 bg-white p-5 sm:p-8 md:p-10 shadow-blue-xl">
      <div className="mb-5 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-black text-brand-navy">Send an Enquiry</h3>
        <p className="mt-1 text-xs font-semibold text-brand-navy/60">
          Takes 30 seconds · Instant WhatsApp response &amp; counselling within 24 hours
        </p>
      </div>

      <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit} noValidate>
        {/* Name & Phone in 2-column grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2">
          {/* Name Field */}
          <div>
            <label htmlFor="lead-name" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-brand-navy">
              Your Name <span className="text-brand-orange">*</span>
            </label>
            <input
              id="lead-name"
              name="name"
              value={values.name}
              onChange={handleChange}
              required
              placeholder="Your full name"
              autoComplete="name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "lead-name-error" : undefined}
              className={`w-full rounded-xl border-2 px-3.5 py-3 text-base sm:text-sm font-semibold text-brand-navy outline-none transition-all placeholder:text-brand-navy/40 focus:ring-4 ${
                errors.name
                  ? "border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-200"
                  : "border-brand-blue/20 bg-brand-blue-wash/40 focus:border-brand-blue focus:bg-white focus:ring-brand-blue/15"
              }`}
            />
            {errors.name && (
              <p id="lead-name-error" className="mt-1.5 text-xs font-bold text-rose-600">
                {errors.name}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="lead-phone" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-brand-navy">
              Phone Number <span className="text-brand-orange">*</span>
            </label>
            <input
              id="lead-phone"
              name="phone"
              type="tel"
              value={values.phone}
              onChange={handleChange}
              required
              placeholder="+91 98765 43210"
              autoComplete="tel"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "lead-phone-error" : undefined}
              className={`w-full rounded-xl border-2 px-3.5 py-3 text-base sm:text-sm font-semibold text-brand-navy outline-none transition-all placeholder:text-brand-navy/40 focus:ring-4 ${
                errors.phone
                  ? "border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-200"
                  : "border-brand-blue/20 bg-brand-blue-wash/40 focus:border-brand-blue focus:bg-white focus:ring-brand-blue/15"
              }`}
            />
            {errors.phone && (
              <p id="lead-phone-error" className="mt-1.5 text-xs font-bold text-rose-600">
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="lead-email" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-brand-navy">
            Email Address <span className="text-brand-orange">*</span>
          </label>
          <input
            id="lead-email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "lead-email-error" : undefined}
            className={`w-full rounded-xl border-2 px-3.5 py-3 text-base sm:text-sm font-semibold text-brand-navy outline-none transition-all placeholder:text-brand-navy/40 focus:ring-4 ${
              errors.email
                ? "border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-200"
                : "border-brand-blue/20 bg-brand-blue-wash/40 focus:border-brand-blue focus:bg-white focus:ring-brand-blue/15"
            }`}
          />
          {errors.email && (
            <p id="lead-email-error" className="mt-1.5 text-xs font-bold text-rose-600">
              {errors.email}
            </p>
          )}
        </div>

        {/* Message / Course Interest Field */}
        <div>
          <label htmlFor="lead-message" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-brand-navy">
            What are you curious about?
          </label>
          <textarea
            id="lead-message"
            name="message"
            rows={3}
            value={values.message}
            onChange={handleChange}
            placeholder="Tell us about the course or career path you want to pursue..."
            className="w-full rounded-xl border-2 border-brand-blue/20 bg-brand-blue-wash/40 px-3.5 py-3 text-base sm:text-sm font-semibold text-brand-navy placeholder:text-brand-navy/40 outline-none transition-all focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/15 resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange px-6 py-4 text-sm font-black uppercase tracking-wider text-white shadow-blue-md transition-all hover:-translate-y-0.5 hover:bg-[#d96a10] hover:shadow-blue-lg active:translate-y-0 disabled:opacity-70 cursor-pointer"
          disabled={status === "submitting"}
          type="submit"
        >
          <span>{status === "submitting" ? "Connecting to WhatsApp..." : "Start a Conversation"}</span>
          <span className="text-xs">↗</span>
        </button>
      </form>
    </div>
  );
}