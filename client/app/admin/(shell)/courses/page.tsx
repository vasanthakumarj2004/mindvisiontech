"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Plus, Pencil, Trash2, Eye, Loader2, X, Search, CheckCircle, XCircle,
} from "lucide-react";
import {
  getAdminCourses,
  createAdminCourse,
  updateAdminCourse,
  deleteAdminCourse,
  type Course,
} from "@/lib/adminApi";
import { useToast } from "@/components/admin/Toast";

// ── Helpers ─────────────────────────────────────────────────────────────────

type FormData = {
  name: string;
  slug: string;
  description: string;
  duration: string;
  fees: string;
  thumbnailUrl: string;
  isActive: boolean;
};

const empty: FormData = {
  name: "",
  slug: "",
  description: "",
  duration: "",
  fees: "",
  thumbnailUrl: "",
  isActive: true,
};

function toSlug(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ── Course Form Modal ────────────────────────────────────────────────────────

function CourseModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Course | null;
  onClose: () => void;
  onSave: (course: Course) => void;
}) {
  const editing = !!initial;
  const [form, setForm] = useState<FormData>(
    initial
      ? {
          name: initial.name,
          slug: initial.slug,
          description: initial.description,
          duration: initial.duration,
          fees: String(initial.fees ?? ""),
          thumbnailUrl: initial.image ?? "",
          isActive: initial.isActive,
        }
      : empty
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function set<K extends keyof FormData>(k: K, v: FormData[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      const payload = { ...form, fees: Number(form.fees) };
      const course = editing
        ? await updateAdminCourse(initial!._id, payload)
        : await createAdminCourse(payload);
      onSave(course);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-black text-brand-navy">
            {editing ? "Edit Course" : "Add Course"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {err && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">
              {err}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Course Name *
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => {
                set("name", e.target.value);
                if (!editing) set("slug", toSlug(e.target.value));
              }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
              placeholder="e.g. Embedded Systems"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Slug * <span className="normal-case font-normal text-gray-400">(URL identifier)</span>
            </label>
            <input
              required
              value={form.slug}
              onChange={(e) => set("slug", toSlug(e.target.value))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
              placeholder="e.g. embedded-systems"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue resize-none"
              placeholder="Short course description…"
            />
          </div>

          {/* Duration + Fees */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Duration *
              </label>
              <input
                required
                value={form.duration}
                onChange={(e) => set("duration", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                placeholder="e.g. 6 months"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Fees (₹) *
              </label>
              <input
                required
                type="number"
                min={0}
                value={form.fees}
                onChange={(e) => set("fees", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                placeholder="e.g. 25000"
              />
            </div>
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Thumbnail URL
            </label>
            <input
              type="url"
              value={form.thumbnailUrl}
              onChange={(e) => set("thumbnailUrl", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
              placeholder="https://…"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set("isActive", !form.isActive)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                form.isActive ? "bg-brand-blue" : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                  form.isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm font-semibold text-gray-700">
              {form.isActive ? "Active (visible on site)" : "Inactive (hidden)"}
            </span>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="course-form"
            onClick={handleSubmit as unknown as React.MouseEventHandler<HTMLButtonElement>}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-2 text-sm font-bold text-white hover:bg-brand-blue-deep disabled:opacity-60 transition"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {editing ? "Save Changes" : "Create Course"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── View Modal ───────────────────────────────────────────────────────────────

function ViewModal({ course, onClose }: { course: Course; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-black text-brand-navy">Course Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-3">
          {[
            ["Name", course.name],
            ["Slug", course.slug],
            ["Duration", course.duration],
            ["Fees", `₹${course.fees?.toLocaleString()}`],
            ["Status", course.isActive ? "Active" : "Inactive"],
            ["Created", new Date(course.createdAt).toLocaleDateString("en-IN")],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-3">
              <span className="w-24 shrink-0 text-xs font-bold uppercase tracking-wider text-gray-400">
                {k}
              </span>
              <span className="text-sm font-semibold text-gray-800">{v}</span>
            </div>
          ))}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Description
            </span>
            <p className="mt-1 text-sm text-gray-700 leading-relaxed">{course.description}</p>
          </div>
        </div>
        <div className="border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"add" | "edit" | "view" | null>(null);
  const [selected, setSelected] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { show, ToastUI } = useToast();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setCourses(await getAdminCourses());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(course: Course) {
    if (!confirm(`Delete "${course.name}"? This cannot be undone.`)) return;
    setDeleting(course._id);
    try {
      await deleteAdminCourse(course._id);
      setCourses((cs) => cs.filter((c) => c._id !== course._id));
      show("Course deleted successfully", "success");
    } catch (e: unknown) {
      show(e instanceof Error ? e.message : "Delete failed", "error");
    } finally {
      setDeleting(null);
    }
  }

  function handleSaved(course: Course) {
    setCourses((cs) => {
      const idx = cs.findIndex((c) => c._id === course._id);
      if (idx !== -1) {
        const updated = [...cs];
        updated[idx] = course;
        return updated;
      }
      return [course, ...cs];
    });
    setModal(null);
    show(modal === "edit" ? "Course updated!" : "Course created!", "success");
  }

  const filtered = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {ToastUI}

      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-brand-navy">Courses</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your course catalogue.</p>
        </div>
        <button
          onClick={() => { setSelected(null); setModal("add"); }}
          className="flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-blue-deep transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Course
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses…"
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center text-sm text-gray-400">
          No courses found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {["Name", "Slug", "Duration", "Fees", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-black uppercase tracking-wider text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((course) => (
                <tr key={course._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm font-bold text-brand-navy whitespace-nowrap">
                    {course.name}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500 font-mono">{course.slug}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">{course.duration}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    ₹{course.fees?.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    {course.isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                        <CheckCircle className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500">
                        <XCircle className="h-3 w-3" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        title="View"
                        onClick={() => { setSelected(course); setModal("view"); }}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-brand-blue transition"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        title="Edit"
                        onClick={() => { setSelected(course); setModal("edit"); }}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-yellow-50 hover:text-yellow-600 transition"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => handleDelete(course)}
                        disabled={deleting === course._id}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-40"
                      >
                        {deleting === course._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {(modal === "add" || modal === "edit") && (
        <CourseModal
          initial={modal === "edit" ? selected : null}
          onClose={() => setModal(null)}
          onSave={handleSaved}
        />
      )}
      {modal === "view" && selected && (
        <ViewModal course={selected} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
