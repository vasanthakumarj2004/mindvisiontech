"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  Upload, Trash2, Download, RefreshCw, Loader2, FileText, X,
} from "lucide-react";
import {
  getInternshipTracks,
  getTrackPdfs,
  uploadTrackPdf,
  replaceTrackPdf,
  deleteTrackPdf,
  formatFileSize,
  type InternshipTrack,
  type PdfMaterial,
} from "@/lib/adminApi";
import { useToast } from "@/components/admin/Toast";

// ── Upload / Replace Modal ─────────────────────────────────────────────────

function PdfModal({
  trackId,
  replacing,
  onClose,
  onDone,
}: {
  trackId: string;
  replacing: PdfMaterial | null;
  onClose: () => void;
  onDone: (pdf: PdfMaterial) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState(replacing?.title ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      setErr("Only PDF files are accepted.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setErr("File is larger than 10 MB.");
      return;
    }
    setErr(null);
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.pdf$/i, ""));
  }

  async function handleSave() {
    if (!file) return setErr("Please select a PDF file.");
    setSaving(true);
    setErr(null);
    try {
      let result: PdfMaterial;
      if (replacing) {
        const r = await replaceTrackPdf(trackId, replacing._id, file, title || undefined);
        result = r.data;
      } else {
        const r = await uploadTrackPdf(trackId, file, title || undefined);
        result = r.data;
      }
      onDone(result);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-black text-brand-navy">
            {replacing ? "Replace PDF" : "Upload PDF"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {err && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">
              {err}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              PDF Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Auto-filled from filename…"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
            />
          </div>

          {/* File picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              PDF File * <span className="normal-case font-normal text-gray-400">(max 10 MB)</span>
            </label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-8 text-sm text-gray-400 hover:border-brand-blue hover:text-brand-blue transition"
            >
              <FileText className="h-8 w-8 opacity-40" />
              {file ? (
                <span className="font-semibold text-gray-700">
                  {file.name} ({formatFileSize(file.size)})
                </span>
              ) : (
                <span>Click to browse a PDF file</span>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={pickFile}
            />
          </div>

          {replacing && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 font-semibold">
              ⚠ The existing file will be permanently deleted from storage when you save.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !file}
            className="flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-2 text-sm font-bold text-white hover:bg-brand-blue-deep disabled:opacity-60 transition"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {replacing ? "Replace File" : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

const SLUG_TO_NAME: Record<string, string> = {
  "3-day": "3 Day Program",
  "5-day": "5 Day Program",
  "12-day": "12 Day Program",
};

export default function InternshipTrackPage() {
  const { trackSlug } = useParams<{ trackSlug: string }>();
  const [track, setTrack] = useState<InternshipTrack | null>(null);
  const [pdfs, setPdfs] = useState<PdfMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<"upload" | "replace" | null>(null);
  const [replacing, setReplacing] = useState<PdfMaterial | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { show, ToastUI } = useToast();

  useEffect(() => {
    if (trackSlug) load(trackSlug);
  }, [trackSlug]);

  async function load(slug: string) {
    setLoading(true);
    setError(null);
    try {
      // Find track by slug
      const tracks = await getInternshipTracks();
      const t = tracks.find((tr) => tr.slug === slug);
      if (!t) throw new Error("Track not found");
      setTrack(t);

      const res = await getTrackPdfs(t._id);
      setPdfs(res.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(pdf: PdfMaterial) {
    if (!confirm(`Delete "${pdf.title}"? This also removes the file from storage.`)) return;
    setDeleting(pdf._id);
    try {
      await deleteTrackPdf(track!._id, pdf._id);
      setPdfs((ps) => ps.filter((p) => p._id !== pdf._id));
      show("PDF deleted", "success");
    } catch (e: unknown) {
      show(e instanceof Error ? e.message : "Delete failed", "error");
    } finally {
      setDeleting(null);
    }
  }

  function handleDone(pdf: PdfMaterial) {
    if (replacing) {
      setPdfs((ps) => ps.map((p) => (p._id === pdf._id ? pdf : p)));
      show("PDF replaced successfully", "success");
    } else {
      setPdfs((ps) => [pdf, ...ps]);
      show("PDF uploaded successfully", "success");
    }
    setModal(null);
    setReplacing(null);
  }

  const trackName = SLUG_TO_NAME[trackSlug] ?? trackSlug;

  return (
    <div>
      {ToastUI}

      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-orange mb-1">
            Internship Materials
          </p>
          <h1 className="text-2xl font-black text-brand-navy">{trackName}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {loading ? "Loading…" : `${pdfs.length} PDF${pdfs.length !== 1 ? "s" : ""} in this track`}
          </p>
        </div>
        <button
          onClick={() => { setReplacing(null); setModal("upload"); }}
          disabled={!track}
          className="flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-blue-deep disabled:opacity-60 transition shadow-sm"
        >
          <Upload className="h-4 w-4" />
          Upload PDF
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && pdfs.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 py-20 text-center">
          <FileText className="h-12 w-12 text-gray-200" />
          <p className="text-sm font-semibold text-gray-400">
            No PDFs uploaded yet for this track.
          </p>
          <button
            onClick={() => { setReplacing(null); setModal("upload"); }}
            className="mt-2 flex items-center gap-1.5 rounded-lg bg-brand-blue px-4 py-2 text-xs font-bold text-white hover:bg-brand-blue-deep transition"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload First PDF
          </button>
        </div>
      )}

      {!loading && pdfs.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {["Title", "Size", "Uploaded By", "Date", "Actions"].map((h) => (
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
              {pdfs.map((pdf) => {
                const uploader =
                  typeof pdf.uploadedBy === "object" ? pdf.uploadedBy.email : "—";
                return (
                  <tr key={pdf._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-red-400" />
                        <span className="text-sm font-semibold text-brand-navy">{pdf.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {formatFileSize(pdf.fileSize)}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">{uploader}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(pdf.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {/* Download */}
                        <a
                          href={pdf.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View/Download"
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-brand-blue transition"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        {/* Replace */}
                        <button
                          title="Replace"
                          onClick={() => {
                            setReplacing(pdf);
                            setModal("replace");
                          }}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-yellow-50 hover:text-yellow-600 transition"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        {/* Delete */}
                        <button
                          title="Delete"
                          onClick={() => handleDelete(pdf)}
                          disabled={deleting === pdf._id}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-40"
                        >
                          {deleting === pdf._id ? (
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

      {/* Modal */}
      {(modal === "upload" || modal === "replace") && track && (
        <PdfModal
          trackId={track._id}
          replacing={modal === "replace" ? replacing : null}
          onClose={() => { setModal(null); setReplacing(null); }}
          onDone={handleDone}
        />
      )}
    </div>
  );
}
