"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import {
  MessageCircle,
  X,
  RotateCcw,
  Send,
  MapPin,
  Phone,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { companyInfo } from "@/data/company";
import { coursesData } from "@/data/courses";
import type { Course } from "@/lib/api";
import { chatbotConfig } from "@/config/chatbot";

type Step =
  | "root"
  | "select_category"
  | "select_course"
  | "course_detail"
  | "branch"
  | "enquiry_name"
  | "enquiry_phone"
  | "enquiry_complete";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text?: string;
  component?: "course_detail" | "branch_card" | "enquiry_summary";
  courseData?: Course;
  enquiryData?: { name: string; phone: string };
}

export function CourseChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("root");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Form input state for single-line enquiry steps
  const [inputName, setInputName] = useState("");
  const [inputPhone, setInputPhone] = useState("");
  const [inputError, setInputError] = useState("");

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageIdRef = useRef(0);
  const shouldReduceMotion = useReducedMotion();

  // Categories extracted dynamically from courses data
  const categories = Array.from(
    new Set(coursesData.map((c) => c.category).filter(Boolean))
  ) as string[];

  // Auto-scroll to bottom of chat when new message arrives
  useEffect(() => {
    if (isOpen && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: shouldReduceMotion ? "auto" : "smooth",
      });
    }
  }, [messages, step, isOpen, shouldReduceMotion]);

  // Auto-open once per browser session without interrupting internal navigation.
  useEffect(() => {
    if (sessionStorage.getItem(chatbotConfig.autoOpenSessionKey)) return;

    const timer = window.setTimeout(() => {
      if (sessionStorage.getItem(chatbotConfig.autoOpenSessionKey)) return;
      sessionStorage.setItem(chatbotConfig.autoOpenSessionKey, "true");
      setIsOpen(true);
    }, chatbotConfig.autoOpenDelayMs);

    return () => window.clearTimeout(timer);
  }, []);

  // Focus input automatically on text enquiry steps
  useEffect(() => {
    if (step === "enquiry_name" || step === "enquiry_phone") {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [step]);

  // Initialize with opening message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      resetChat();
    }
  }, [isOpen]);

  function resetChat() {
    setStep("root");
    setSelectedCategory(null);
    setSelectedCourse(null);
    setInputName("");
    setInputPhone("");
    setInputError("");
    setMessages([
      {
        id: "init-1",
        sender: "bot",
        text: chatbotConfig.welcomeMessage,
      },
    ]);
  }

  function handleClose() {
    sessionStorage.setItem(chatbotConfig.autoOpenSessionKey, "true");
    setIsOpen(false);
  }

  // Helper to add bot and user messages
  function addMessage(msg: Omit<ChatMessage, "id">) {
    const id = `msg-${messageIdRef.current++}`;
    setMessages((prev) => [...prev, { ...msg, id }]);
  }

  // ── Step Handlers ───────────────────────────────────────────────────────────

  function handleRootChoice(choice: "courses" | "branches" | "enquiry") {
    if (choice === "courses") {
      addMessage({ sender: "user", text: "Find a course" });
      setTimeout(() => {
        addMessage({
          sender: "bot",
          text: "Which area are you interested in?",
        });
        setStep("select_category");
      }, 250);
    } else if (choice === "branches") {
      addMessage({ sender: "user", text: "Locate a branch" });
      setTimeout(() => {
        addMessage({
          sender: "bot",
          text: "Here's our head office location:",
          component: "branch_card",
        });
        setStep("branch");
      }, 250);
    } else if (choice === "enquiry") {
      addMessage({ sender: "user", text: "Send an enquiry" });
      setTimeout(() => {
        addMessage({
          sender: "bot",
          text: "What's your name?",
        });
        setStep("enquiry_name");
      }, 250);
    }
  }

  function handleCategoryChoice(cat: string) {
    setSelectedCategory(cat);
    addMessage({ sender: "user", text: cat });
    setTimeout(() => {
      addMessage({
        sender: "bot",
        text: `Here are our ${cat} programs:`,
      });
      setStep("select_course");
    }, 250);
  }

  function handleCourseChoice(course: Course) {
    setSelectedCourse(course);
    addMessage({ sender: "user", text: course.name });
    setTimeout(() => {
      addMessage({
        sender: "bot",
        text: `Here are the details for ${course.name}:`,
        component: "course_detail",
        courseData: course,
      });
      setStep("course_detail");
    }, 250);
  }

  function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inputName.trim();
    if (!trimmed || trimmed.length < 2) {
      setInputError("Please enter your name (at least 2 characters).");
      return;
    }
    setInputError("");
    addMessage({ sender: "user", text: trimmed });
    setTimeout(() => {
      addMessage({
        sender: "bot",
        text: `Nice to meet you, ${trimmed}! What is the best phone number to reach you?`,
      });
      setStep("enquiry_phone");
    }, 250);
  }

  function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanPhone = inputPhone.replace(/[\s\-()]/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setInputError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setInputError("");
    addMessage({ sender: "user", text: inputPhone.trim() });
    setTimeout(() => {
      addMessage({
        sender: "bot",
        text: "Great! Your enquiry details are ready. Send them directly to our admissions team via WhatsApp:",
        component: "enquiry_summary",
        enquiryData: { name: inputName.trim(), phone: inputPhone.trim() },
      });
      setStep("enquiry_complete");
    }, 250);
  }

  // Builds structured WhatsApp enquiry message matching LeadForm.tsx
  function buildEnquiryWhatsAppUrl(name: string, phone: string, courseName?: string) {
    const lines = [
      "📋 *New Admission Enquiry — MindVisionTech Innovation*",
      "──────────────────────────────",
      `👤 *Name:* ${name}`,
      `📞 *Phone:* ${phone}`,
      `💬 *Interested In:* ${courseName ? `${courseName} course` : "Course guidance & admission details"}`,
      "──────────────────────────────",
      "_Submitted via MindVisionTech Course Assistant._",
    ];
    return `https://wa.me/${companyInfo.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
  }

  // Animation variants
  const messageVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
  };

  return (
    <>
      {/* ── Floating Launcher Button ────────────────────────────────────────── */}
      {/* Positioned vertically above WhatsAppFloat (WhatsApp + Instagram) */}
      <div className="fixed bottom-5 right-4 z-[90] sm:right-6">
        <button
          onClick={() => (isOpen ? handleClose() : setIsOpen(true))}
          type="button"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close Course Assistant" : "Open Course Assistant Chatbot"}
          className="group relative z-[90] flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-brand-navy text-white shadow-blue-lg transition-all duration-300 hover:scale-110 hover:bg-brand-blue active:scale-95 focus:outline-none focus:ring-4 focus:ring-brand-blue/30"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white transition-transform group-hover:rotate-90" />
          ) : (
            <>
              <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              {/* Subtle animated notification dot */}
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-orange opacity-75" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-brand-orange" />
              </span>
            </>
          )}
        </button>
      </div>

      {/* ── Chat Panel Modal / Bottom Sheet ─────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile only */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs sm:hidden"
              aria-hidden="true"
            />

            <motion.div
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 20, scale: 0.95 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 20, scale: 0.95 }
              }
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed inset-x-0 bottom-0 z-[130] flex h-[min(520px,78vh)] max-h-[78vh] flex-col overflow-hidden rounded-t-3xl border-t-2 border-brand-blue/15 bg-white shadow-xl sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[520px] sm:max-h-[85vh] sm:w-[380px] sm:rounded-3xl sm:border-2 sm:border-brand-blue/15"
              role="dialog"
              aria-label="MindVisionTech Course Assistant"
            >
              {/* ── Header ──────────────────────────────────────────────────────── */}
              <div className="flex items-center justify-between border-b border-brand-blue/15 bg-brand-navy px-4 py-3.5 text-white sm:rounded-t-3xl">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange/20 text-brand-orange">
                    <Sparkles className="h-4 w-4 text-brand-orange" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold tracking-wide text-white">
                      Course Assistant
                    </h3>
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold text-white/70">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      MindVisionTech Guide
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={resetChat}
                    type="button"
                    title="Start Over"
                    aria-label="Start conversation over"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleClose}
                    type="button"
                    title="Close Chat"
                    aria-label="Close chat window"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* ── Chat Messages Body ──────────────────────────────────────────── */}
              <div
                ref={chatContainerRef}
                className="flex-1 space-y-3 overflow-y-auto p-4 text-sm leading-relaxed"
              >
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    className={`flex flex-col ${
                      msg.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    {/* Message Bubble */}
                    {msg.text && (
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm ${
                          msg.sender === "user"
                            ? "bg-brand-navy font-bold text-white shadow-xs rounded-br-xs"
                            : "bg-brand-blue-wash text-brand-navy border border-brand-blue/15 font-medium rounded-bl-xs"
                        }`}
                      >
                        {msg.text}
                      </div>
                    )}

                    {/* Rich Component: Course Detail Card */}
                    {msg.component === "course_detail" && msg.courseData && (
                      <div className="mt-2 w-full max-w-[95%] rounded-2xl border border-brand-blue/20 bg-white p-3.5 shadow-sm space-y-2.5 text-xs text-brand-navy">
                        <div className="flex items-start justify-between gap-2 border-b border-brand-blue/10 pb-2">
                          <div>
                            <p className="font-extrabold text-sm text-brand-blue">
                              {msg.courseData.name}
                            </p>
                            <p className="text-[11px] font-semibold text-brand-navy/70">
                              ⏱ Duration: {msg.courseData.duration}
                            </p>
                          </div>
                        </div>

                        {msg.courseData.topics && msg.courseData.topics.length > 0 && (
                          <div>
                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-brand-navy/60">
                              Key Topics Covered:
                            </p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {msg.courseData.topics.map((t) => (
                                <span
                                  key={t}
                                  className="rounded-md border border-brand-blue/15 bg-brand-blue-wash px-1.5 py-0.5 text-[10px] font-bold text-brand-blue"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-1 flex flex-col gap-2">
                          <a
                            href={`https://wa.me/${companyInfo.whatsapp}?text=${encodeURIComponent(
                              `Hi, I would like to enquire about the ${msg.courseData.name} course at MindVisionTech.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-brand-orange px-3.5 py-2 text-xs font-black text-white shadow-xs transition-all hover:bg-[#d96a10] active:scale-95"
                          >
                            <span>Enquire about this course</span>
                            <ArrowRight className="h-3 w-3" />
                          </a>

                          <Link
                            href={`/courses/${msg.courseData.slug}`}
                            onClick={handleClose}
                            className="flex items-center justify-center gap-1 text-[11px] font-bold text-brand-blue hover:underline"
                          >
                            <span>View full curriculum page</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Rich Component: Head Office Branch Card */}
                    {msg.component === "branch_card" && (
                      <div className="mt-2 w-full max-w-[95%] rounded-2xl border border-brand-blue/20 bg-white p-3.5 shadow-sm space-y-2.5 text-xs text-brand-navy">
                        <div className="flex items-center gap-2 text-brand-blue font-bold">
                          <MapPin className="h-4 w-4 text-brand-orange shrink-0" />
                          <span className="text-sm font-extrabold">{companyInfo.name}</span>
                        </div>

                        <p className="text-xs text-brand-navy/80 leading-relaxed">
                          {companyInfo.address.full}
                        </p>

                        <div className="flex items-center gap-2 text-xs font-semibold text-brand-navy/90">
                          <Phone className="h-3.5 w-3.5 text-brand-blue shrink-0" />
                          <span>{companyInfo.phone}</span>
                        </div>

                        <div className="pt-1 flex flex-wrap gap-2">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              companyInfo.address.full
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-brand-blue"
                          >
                            <span>Get directions</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>

                          <a
                            href={companyInfo.phoneHref}
                            className="inline-flex items-center gap-1.5 rounded-full border border-brand-blue/30 bg-white px-3 py-1.5 text-xs font-bold text-brand-blue transition-all hover:bg-brand-blue-wash"
                          >
                            <span>Call us</span>
                            <Phone className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Rich Component: Enquiry WhatsApp Summary Card */}
                    {msg.component === "enquiry_summary" && msg.enquiryData && (
                      <div className="mt-2 w-full max-w-[95%] rounded-2xl border border-brand-blue/20 bg-white p-3.5 shadow-sm space-y-3 text-xs text-brand-navy">
                        <div className="rounded-xl bg-brand-blue-wash p-2.5 space-y-1">
                          <p>
                            <span className="font-semibold text-brand-navy/60">Name:</span>{" "}
                            <span className="font-bold text-brand-navy">{msg.enquiryData.name}</span>
                          </p>
                          <p>
                            <span className="font-semibold text-brand-navy/60">Phone:</span>{" "}
                            <span className="font-bold text-brand-navy">{msg.enquiryData.phone}</span>
                          </p>
                        </div>

                        <a
                          href={buildEnquiryWhatsAppUrl(
                            msg.enquiryData.name,
                            msg.enquiryData.phone
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-xs transition-all hover:bg-emerald-700 active:scale-95"
                        >
                          <span>Send via WhatsApp</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* ── Interactive Decision-Tree Options ───────────────────────── */}
                {/* 1. Root Options */}
                {step === "root" && (
                  <motion.div
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col gap-2 pt-1"
                  >
                    <button
                      onClick={() => handleRootChoice("courses")}
                      type="button"
                      className="rounded-full border border-brand-blue/30 bg-white px-4 py-2 text-xs font-extrabold text-brand-blue shadow-2xs transition-all hover:bg-brand-blue-wash hover:border-brand-blue text-left flex items-center justify-between cursor-pointer"
                    >
                      <span>🎓 Find a course</span>
                      <ArrowRight className="h-3 w-3 text-brand-blue/60" />
                    </button>
                    <button
                      onClick={() => handleRootChoice("branches")}
                      type="button"
                      className="rounded-full border border-brand-blue/30 bg-white px-4 py-2 text-xs font-extrabold text-brand-blue shadow-2xs transition-all hover:bg-brand-blue-wash hover:border-brand-blue text-left flex items-center justify-between cursor-pointer"
                    >
                      <span>📍 Locate a branch</span>
                      <ArrowRight className="h-3 w-3 text-brand-blue/60" />
                    </button>
                    <button
                      onClick={() => handleRootChoice("enquiry")}
                      type="button"
                      className="rounded-full border border-brand-blue/30 bg-white px-4 py-2 text-xs font-extrabold text-brand-blue shadow-2xs transition-all hover:bg-brand-blue-wash hover:border-brand-blue text-left flex items-center justify-between cursor-pointer"
                    >
                      <span>💬 Send an enquiry</span>
                      <ArrowRight className="h-3 w-3 text-brand-blue/60" />
                    </button>
                  </motion.div>
                )}

                {/* 2. Select Category Options */}
                {step === "select_category" && (
                  <motion.div
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-wrap gap-2 pt-1"
                  >
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleCategoryChoice(cat)}
                        type="button"
                        className="rounded-full border border-brand-blue/30 bg-white px-3.5 py-1.5 text-xs font-extrabold text-brand-blue shadow-2xs transition-all hover:bg-brand-blue-wash hover:border-brand-blue active:scale-95 cursor-pointer"
                      >
                        {cat}
                      </button>
                    ))}
                    <button
                      onClick={resetChat}
                      type="button"
                      className="rounded-full border border-brand-navy/20 bg-white px-3 py-1.5 text-[11px] font-bold text-brand-navy/70 hover:bg-brand-blue-wash cursor-pointer"
                    >
                      ← Back to menu
                    </button>
                  </motion.div>
                )}

                {/* 3. Select Course Options in Category */}
                {step === "select_course" && selectedCategory && (
                  <motion.div
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col gap-1.5 pt-1"
                  >
                    {coursesData
                      .filter((c) => c.category === selectedCategory)
                      .map((course) => (
                        <button
                          key={course._id}
                          onClick={() => handleCourseChoice(course)}
                          type="button"
                          className="rounded-xl border border-brand-blue/25 bg-white px-3 py-2 text-xs font-extrabold text-brand-blue text-left shadow-2xs transition-all hover:bg-brand-blue-wash hover:border-brand-blue flex items-center justify-between cursor-pointer"
                        >
                          <span>{course.name}</span>
                          <span className="text-[10px] text-brand-navy/60 font-semibold">
                            {course.duration}
                          </span>
                        </button>
                      ))}

                    <button
                      onClick={() => setStep("select_category")}
                      type="button"
                      className="mt-1 text-left text-[11px] font-bold text-brand-orange hover:underline self-start cursor-pointer"
                    >
                      ← Choose another category
                    </button>
                  </motion.div>
                )}

                {/* 4. Course Detail Follow-up Options */}
                {step === "course_detail" && (
                  <motion.div
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-wrap gap-2 pt-2"
                  >
                    <button
                      onClick={() => setStep("select_course")}
                      type="button"
                      className="rounded-full border border-brand-blue/30 bg-white px-3 py-1.5 text-[11px] font-bold text-brand-blue hover:bg-brand-blue-wash cursor-pointer"
                    >
                      ← Other {selectedCategory} courses
                    </button>
                    <button
                      onClick={resetChat}
                      type="button"
                      className="rounded-full border border-brand-navy/20 bg-white px-3 py-1.5 text-[11px] font-bold text-brand-navy/70 hover:bg-brand-blue-wash cursor-pointer"
                    >
                      Main menu
                    </button>
                  </motion.div>
                )}

                {/* 5. Branch Follow-up Options */}
                {step === "branch" && (
                  <motion.div
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-wrap gap-2 pt-2"
                  >
                    <Link
                      href="/contact#branches"
                      onClick={handleClose}
                      className="rounded-full border border-brand-blue/30 bg-white px-3 py-1.5 text-[11px] font-bold text-brand-blue hover:bg-brand-blue-wash"
                    >
                      View all branch locations ↗
                    </Link>
                    <button
                      onClick={resetChat}
                      type="button"
                      className="rounded-full border border-brand-navy/20 bg-white px-3 py-1.5 text-[11px] font-bold text-brand-navy/70 hover:bg-brand-blue-wash cursor-pointer"
                    >
                      Main menu
                    </button>
                  </motion.div>
                )}

                {/* 6. Completed Enquiry Follow-up */}
                {step === "enquiry_complete" && (
                  <motion.div
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    className="pt-2"
                  >
                    <button
                      onClick={resetChat}
                      type="button"
                      className="rounded-full border border-brand-blue/30 bg-white px-3.5 py-1.5 text-xs font-bold text-brand-blue hover:bg-brand-blue-wash cursor-pointer"
                    >
                      ← Start new enquiry or explore courses
                    </button>
                  </motion.div>
                )}
              </div>

              {/* ── Single-Line Text Input Form (Only for Name / Phone steps) ── */}
              {(step === "enquiry_name" || step === "enquiry_phone") && (
                <div className="border-t border-brand-blue/15 bg-brand-cream/60 p-3 sm:rounded-b-3xl">
                  <form
                    onSubmit={step === "enquiry_name" ? handleNameSubmit : handlePhoneSubmit}
                    className="flex items-center gap-2"
                  >
                    <input
                      ref={inputRef}
                      type={step === "enquiry_name" ? "text" : "tel"}
                      value={step === "enquiry_name" ? inputName : inputPhone}
                      onChange={(e) => {
                        setInputError("");
                        if (step === "enquiry_name") {
                          setInputName(e.target.value);
                        } else {
                          setInputPhone(e.target.value);
                        }
                      }}
                      placeholder={
                        step === "enquiry_name"
                          ? "Type your name..."
                          : "Type your 10-digit mobile number..."
                      }
                      className="flex-1 rounded-full border-2 border-brand-blue/20 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-brand-navy outline-none transition-all placeholder:text-brand-navy/40 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15"
                    />
                    <button
                      type="submit"
                      aria-label="Submit"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white shadow-xs transition-all hover:bg-[#d96a10] active:scale-95 cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                  {inputError && (
                    <p className="mt-1.5 px-2 text-[11px] font-bold text-rose-600">
                      {inputError}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
