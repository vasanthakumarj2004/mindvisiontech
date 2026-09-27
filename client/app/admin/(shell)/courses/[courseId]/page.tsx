"use client";

import { useEffect, useState, useRef, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Download,
  FileText,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  Loader2,
} from "lucide-react";
import {
  getAdminCourse,
  getCourseSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectPdfs,
  uploadSubjectPdf,
  deleteSubjectPdf,
  formatFileSize,
  type Course,
  type Subject,
  type PdfMaterial,
} from "@/lib/adminApi";
import { useToast } from "@/components/admin/Toast";

// ─── Subject form modal ─────────────────────────────────────────────────────
function SubjectModal({
  courseId,
  editing,
  onClose,
  onSaved,
}: {
  courseId: string;
  editing: Subject | null;
  onClose: () => void;
  onSaved: (s: Subject) => void;
}) {
  const [name, setName] = useState(editing?.name ?? "");
  const [order, setOrder] = useState(String(editing?.order ?? 0));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Name is required");
    setSaving(true);
    setError("");
    try {
      let result: Subject;
      if (editing) {
        result = await updateSubject(courseId, editing._id, {
          name: name.trim(),
          order: Number(order),
        });
      } else {
        result = await createSubject(courseId, {
          name: name.trim(),
          order: Number(order),
        });
      }
      onSaved(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save subject");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-brand-navy">
            {editing ? "Edit Subject" : "Add Subject"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Subject Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-blue focus:outline-none"
              placeholder="e.g. Introduction to Embedded C"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Display Order
            </label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-blue focus:outline-none"
              placeholder="0"
              min="0"
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
              {editing ? "Save Changes" : "Create Subject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── PDF upload modal ───────────────────────────────────────────────────────
function PdfUploadModal({
  subjectId,
  onClose,
  onUploaded,
}: {
  subjectId: string;
  onClose: () => void;
  onUploaded: (pdf: PdfMaterial) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) return setError("Please select a PDF file");
    setUploading(true);
    setError("");
    try {
      const { data } = await uploadSubjectPdf(subjectId, file, title || undefined);
      onUploaded(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-brand-navy">Upload PDF</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Title (optional)
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-blue focus:outline-none"
              placeholder="Will use filename if blank"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              PDF File *
            </label>
            <div
              className="rounded-xl border-2 border-dashed border-gray-300 p-6 text-center cursor-pointer hover:border-brand-blue transition-colors"
              onClick={() => inputRef.current?.click()}
            >
              {file ? (
                <div className="flex items-center gap-2 justify-center text-sm font-semibold text-brand-blue">
                  <Check className="h-4 w-4" />
                  {file.name}
                </div>
              ) : (
                <div className="text-sm text-gray-400">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  Click to select a PDF file
                </div>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
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
              disabled={uploading || !file}
              className="flex-1 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {uploading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Upload PDF
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Subject row with PDFs ──────────────────────────────────────────────────
function SubjectRow({
  subject,
  courseId,
  onEdit,
  onDeleted,
}: {
  subject: Subject;
  courseId: string;
  onEdit: (s: Subject) => void;
  onDeleted: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [pdfs, setPdfs] = useState<PdfMaterial[]>([]);
  const [loadingPdfs, setLoadingPdfs] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast, ToastUI } = useToast();

  async function loadPdfs() {
    if (pdfs.length > 0) return;
    setLoadingPdfs(true);
    try {
      const data = await getSubjectPdfs(subject._id);
      setPdfs(data);
    } catch {
      toast("Failed to load PDFs", "error");
    } finally {
      setLoadingPdfs(false);
    }
  }

  function handleToggle() {
    setExpanded((v) => !v);
    if (!expanded) loadPdfs();
  }

  async function handleDeleteSubject() {
    if (!confirm(`Delete subject "${subject.name}" and all its PDFs?`)) return;
    setDeleting(true);
    try {
      await deleteSubject(courseId, subject._id);
      toast("Subject deleted", "success");
      onDeleted(subject._id);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Delete failed", "error");
      setDeleting(false);
    }
  }

  async function handleDeletePdf(pdfId: string, pdfTitle: string) {
    if (!confirm(`Delete PDF "${pdfTitle}"?`)) return;
    try {
      await deleteSubjectPdf(subject._id, pdfId);
      setPdfs((prev) => prev.filter((p) => p._id !== pdfId));
      toast("PDF deleted", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Delete failed", "error");
    }
  }

  return (
    <>
      {ToastUI}
      {showUpload && (
        <PdfUploadModal
          subjectId={subject._id}
          onClose={() => setShowUpload(false)}
          onUploaded={(pdf) => {
            setPdfs((prev) => [pdf, ...prev]);
            setShowUpload(false);
            toast("PDF uploaded", "success");
          }}
        />
      )}

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={handleToggle} className="flex items-center gap-2 flex-1 text-left">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
            )}
            <span className="text-sm font-bold text-brand-navy">{subject.name}</span>
            <span className="ml-1 text-xs text-gray-400">Order: {subject.order}</span>
          </button>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => {
                setShowUpload(true);
                if (!expanded) {
                  setExpanded(true);
                  loadPdfs();
                }
              }}
              title="Upload PDF"
              className="flex items-center gap-1 rounded-lg bg-brand-orange/10 px-2.5 py-1.5 text-xs font-semibold text-brand-orange hover:bg-brand-orange/20 transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload
            </button>
            <button
              onClick={() => onEdit(subject)}
              className="rounded-lg p-1.5 hover:bg-gray-100 text-gray-400 hover:text-brand-blue"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleDeleteSubject}
              disabled={deleting}
              className="rounded-lg p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
            {loadingPdfs ? (
              <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading PDFs…
              </div>
            ) : pdfs.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">
                No PDFs yet.{" "}
                <button
                  onClick={() => setShowUpload(true)}
                  className="text-brand-orange font-semibold hover:underline"
                >
                  Upload one
                </button>
              </p>
            ) : (
              <div className="space-y-2">
                {pdfs.map((pdf) => (
                  <div
                    key={pdf._id}
                    className="flex items-center gap-3 rounded-lg bg-white border border-gray-200 px-3 py-2"
                  >
                    <FileText className="h-4 w-4 text-red-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 truncate">{pdf.title}</p>
                      <p className="text-[10px] text-gray-400">{formatFileSize(pdf.fileSize)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={pdf.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded p-1 hover:bg-gray-100 text-gray-400 hover:text-brand-blue"
                        title="Download / View"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                      <button
                        onClick={() => handleDeletePdf(pdf._id, pdf.title)}
                        className="rounded p-1 hover:bg-red-50 text-gray-400 hover:text-red-500"
                        title="Delete PDF"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const courseId = params.courseId;

  const [course, setCourse] = useState<Course | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjectModal, setSubjectModal] = useState<Subject | null | "new">(null);
  const { toast, ToastUI } = useToast();

  useEffect(() => {
    Promise.all([getAdminCourse(courseId), getCourseSubjects(courseId)])
      .then(([c, s]) => {
        setCourse(c);
        setSubjects(s);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [courseId]);

  function handleSubjectSaved(saved: Subject) {
    const wasCreating = subjectModal === "new";
    setSubjects((prev) => {
      const exists = prev.find((s) => s._id === saved._id);
      if (exists) return prev.map((s) => (s._id === saved._id ? saved : s));
      return [...prev, saved];
    });
    setSubjectModal(null);
    toast(wasCreating ? "Subject created" : "Subject updated", "success");
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );

  if (error)
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm font-semibold text-red-700">
        {error}
      </div>
    );

  return (
    <>
      {ToastUI}
      {subjectModal !== null && (
        <SubjectModal
          courseId={courseId}
          editing={subjectModal === "new" ? null : subjectModal}
          onClose={() => setSubjectModal(null)}
          onSaved={handleSubjectSaved}
        />
      )}

      <div className="mb-6">
        <button
          onClick={() => router.push("/admin/courses")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-blue font-semibold mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-brand-navy">{course?.name}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {subjects.length} subject{subjects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setSubjectModal("new")}
            className="flex items-center gap-2 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-blue/90 shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Subject
          </button>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-400 font-semibold mb-3">No subjects yet</p>
          <button
            onClick={() => setSubjectModal("new")}
            className="text-sm font-bold text-brand-blue hover:underline"
          >
            + Add the first subject
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {subjects.map((subject) => (
            <SubjectRow
              key={subject._id}
              subject={subject}
              courseId={courseId}
              onEdit={(s) => setSubjectModal(s)}
              onDeleted={(id) => setSubjects((prev) => prev.filter((s) => s._id !== id))}
            />
          ))}
        </div>
      )}
    </>
  );
}
