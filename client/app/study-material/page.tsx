"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Download, FileText, BookOpen, Layers } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000/api";

type PdfItem = {
  _id: string;
  title: string;
  url: string;
  fileSize: number;
};

type SubjectItem = {
  _id: string;
  name: string;
  pdfs: PdfItem[];
};

type CourseItem = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  subjects: SubjectItem[];
};

function formatSize(bytes: number) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Subject accordion ──────────────────────────────────────────────────────
function SubjectAccordion({ subject }: { subject: SubjectItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 text-brand-orange shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-brand-orange shrink-0" />
        )}
        <Layers className="h-4 w-4 text-brand-orange shrink-0" />
        <span className="text-sm font-bold text-gray-800">{subject.name}</span>
        <span className="ml-auto text-xs text-gray-400">
          {subject.pdfs.length} PDF{subject.pdfs.length !== 1 ? "s" : ""}
        </span>
      </button>

      {open && (
        <div className="bg-gray-50 border-t border-gray-100 px-4 py-3 space-y-2">
          {subject.pdfs.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              No materials available yet.
            </p>
          ) : (
            subject.pdfs.map((pdf) => (
              <div
                key={pdf._id}
                className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-3 py-2.5"
              >
                <FileText className="h-4 w-4 text-red-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{pdf.title}</p>
                  {pdf.fileSize > 0 && (
                    <p className="text-[11px] text-gray-400">{formatSize(pdf.fileSize)}</p>
                  )}
                </div>
                <a
                  href={pdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-brand-orange px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-orange/90 transition-colors shrink-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Course accordion ───────────────────────────────────────────────────────
function CourseAccordion({ course }: { course: CourseItem }) {
  const [open, setOpen] = useState(false);

  const totalPdfs = course.subjects.reduce((sum, s) => sum + s.pdfs.length, 0);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-black text-brand-navy">{course.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {course.subjects.length} subject{course.subjects.length !== 1 ? "s" : ""} ·{" "}
            {totalPdfs} PDF{totalPdfs !== 1 ? "s" : ""}
          </p>
        </div>
        {open ? (
          <ChevronDown className="h-5 w-5 text-gray-400 shrink-0" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-400 shrink-0" />
        )}
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-2 bg-gray-50">
          {course.subjects.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No subjects available yet.
            </p>
          ) : (
            course.subjects.map((subject) => (
              <SubjectAccordion key={subject._id} subject={subject} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function StudyMaterialPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/study-material`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        setCourses(json.data ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-brand-blue py-16 text-center px-4">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-3">Study Material</h1>
        <p className="text-white/70 max-w-xl mx-auto text-base">
          Browse and download course materials organized by subject. All resources are free for
          enrolled students.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-semibold">No study materials available yet.</p>
            <p className="text-gray-400 text-sm mt-1">
              Check back soon — materials are added regularly.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <CourseAccordion key={course._id} course={course} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
