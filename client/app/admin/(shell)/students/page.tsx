"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Search,
  Users,
  IndianRupee,
} from "lucide-react";
import {
  getAdminStudents,
  getAdminCourses,
  createAdminStudent,
  updateAdminStudent,
  deleteAdminStudent,
  type Student,
  type Course,
} from "@/lib/adminApi";
import { useToast } from "@/components/admin/Toast";

// ─── Student Form Modal ─────────────────────────────────────────────────────

function StudentModal({
  initial,
  courses,
  onClose,
  onSaved,
}: {
  initial: Student | null;
  courses: Course[];
  onClose: () => void;
  onSaved: (s: Student) => void;
}) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [courseId, setCourseId] = useState(
    typeof initial?.course === "string" ? initial.course : initial?.course?._id ?? ""
  );
  const [courseFees, setCourseFees] = useState(String(initial?.courseFees ?? ""));
  const [discount, setDiscount] = useState(String(initial?.discount ?? 0));
  const [enrolledAt, setEnrolledAt] = useState(
    initial?.enrolledAt ? initial.enrolledAt.slice(0, 10) : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const finalFees = Math.max(0, Number(courseFees) - Number(discount || 0));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Name is required");
    if (!courseId) return setError("Please select a course");
    if (!courseFees || isNaN(Number(courseFees))) return setError("Valid fees required");
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: name.trim(),
        course: courseId,
        courseFees: Number(courseFees),
        discount: Number(discount || 0),
        ...(enrolledAt ? { enrolledAt } : {}),
      };
      let saved: Student;
      if (isEdit && initial) {
        saved = await updateAdminStudent(initial._id, payload);
      } else {
        saved = await createAdminStudent(payload);
      }
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-brand-navy">
            {isEdit ? "Edit Student" : "Add Student"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Student Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field"
              placeholder="e.g. Rahul Sharma"
              autoFocus
            />
          </div>
          <div>
            <label className="label">Course *</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="field"
            >
              <option value="">Select a course…</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Course Fees (₹) *</label>
              <input
                type="number"
                value={courseFees}
                onChange={(e) => setCourseFees(e.target.value)}
                className="field"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="label">Discount (₹)</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="field"
                placeholder="0"
                min="0"
              />
            </div>
          </div>
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-bold text-emerald-700">
              Final Fees: ₹{finalFees.toLocaleString()}
            </span>
          </div>
          <div>
            <label className="label">Enrolled At</label>
            <input
              type="date"
              value={enrolledAt}
              onChange={(e) => setEnrolledAt(e.target.value)}
              className="field"
            />
          </div>
          {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isEdit ? "Save Changes" : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<Student | null | "new">(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast, ToastUI } = useToast();

  useEffect(() => {
    Promise.all([getAdminStudents(), getAdminCourses()])
      .then(([s, c]) => {
        setStudents(s);
        setCourses(c);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  function handleSaved(saved: Student) {
    const wasCreating = modal === "new";
    setStudents((prev) => {
      const exists = prev.find((s) => s._id === saved._id);
      if (exists) return prev.map((s) => (s._id === saved._id ? saved : s));
      return [saved, ...prev];
    });
    setModal(null);
    toast(wasCreating ? "Student added" : "Student updated", "success");
  }

  async function handleDelete(student: Student) {
    if (!confirm(`Delete student "${student.name}"?`)) return;
    setDeleting(student._id);
    try {
      await deleteAdminStudent(student._id);
      setStudents((prev) => prev.filter((s) => s._id !== student._id));
      toast("Student deleted", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Delete failed", "error");
    } finally {
      setDeleting(null);
    }
  }

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (typeof s.course !== "string" && s.course.name?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      {ToastUI}
      {modal !== null && (
        <StudentModal
          initial={modal === "new" ? null : modal}
          courses={courses}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-brand-navy">Students</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage enrolled students across all courses.
          </p>
        </div>
        <button
          onClick={() => setModal("new")}
          className="flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-blue/90 shadow-sm transition"
        >
          <Plus className="h-4 w-4" />
          Add Student
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students or courses…"
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
        />
      </div>

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
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <Users className="h-10 w-10 mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-400 font-semibold">
            {search ? "No students match your search." : "No students yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {["Name", "Course", "Fees", "Discount", "Final Fees", "Enrolled", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-black uppercase tracking-wider text-gray-500"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((student) => {
                const courseName =
                  typeof student.course === "string"
                    ? student.course
                    : student.course?.name ?? "—";
                return (
                  <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm font-bold text-brand-navy whitespace-nowrap">
                      {student.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{courseName}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      ₹{student.courseFees?.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {student.discount > 0 ? (
                        <span className="text-emerald-600 font-semibold">
                          -₹{student.discount.toLocaleString()}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-brand-navy">
                      ₹{student.finalFees?.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {new Date(student.enrolledAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModal(student)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-yellow-50 hover:text-yellow-600 transition"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student)}
                          disabled={deleting === student._id}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-40"
                          title="Delete"
                        >
                          {deleting === student._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tailwind shorthand classes used inside this page */}
      <style jsx global>{`
        .label {
          display: block;
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }
        .field {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #d1d5db;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
        }
        .field:focus {
          outline: none;
          border-color: var(--color-brand-blue, #0b2b6b);
        }
      `}</style>
    </div>
  );
}
