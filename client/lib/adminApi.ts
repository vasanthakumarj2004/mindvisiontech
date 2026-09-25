/**
 * lib/adminApi.ts
 * Typed fetch wrapper for all admin API calls.
 * Sends cookies automatically (credentials: 'include').
 */

const getBase = () =>
  (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000/api") + "/admin";

async function req<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${getBase()}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Types ──────────────────────────────────────────────────────────────────

export type AdminUser = { id: string; email: string; role: string };

export type Course = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  duration: string;
  fees: number;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type InternshipTrack = {
  _id: string;
  name: string;
  slug: string;
  description: string;
};

export type PdfMaterial = {
  _id: string;
  title: string;
  url: string;
  fileSize: number;
  track: string;
  uploadedBy: { _id: string; email: string } | string;
  uploadedAt: string;
  createdAt: string;
};

export type DashboardStats = {
  totalCourses: number;
  totalTracks: number;
  totalPdfs: number;
};

// ── Auth ───────────────────────────────────────────────────────────────────

export const adminLogin = (email: string, password: string) =>
  req<{ message: string; data: AdminUser }>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const adminLogout = () =>
  req<{ message: string }>("/logout", { method: "POST" });

// ── Dashboard ──────────────────────────────────────────────────────────────

export const getDashboardStats = () =>
  req<{ data: DashboardStats }>("/dashboard").then((r) => r.data);

// ── Courses ────────────────────────────────────────────────────────────────

export const getAdminCourses = () =>
  req<{ data: Course[] }>("/courses").then((r) => r.data);

export const getAdminCourse = (id: string) =>
  req<{ data: Course }>(`/courses/${id}`).then((r) => r.data);

export const createAdminCourse = (payload: Partial<Course & { thumbnailUrl: string }>) =>
  req<{ data: Course }>("/courses", { method: "POST", body: JSON.stringify(payload) }).then(
    (r) => r.data
  );

export const updateAdminCourse = (id: string, payload: Partial<Course & { thumbnailUrl: string }>) =>
  req<{ data: Course }>(`/courses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }).then((r) => r.data);

export const deleteAdminCourse = (id: string) =>
  req<{ message: string }>(`/courses/${id}`, { method: "DELETE" });

// ── Internship Tracks ──────────────────────────────────────────────────────

export const getInternshipTracks = () =>
  req<{ data: InternshipTrack[] }>("/internships").then((r) => r.data);

// ── PDFs ───────────────────────────────────────────────────────────────────

export const getTrackPdfs = (trackId: string) =>
  req<{ data: PdfMaterial[]; track: InternshipTrack }>(`/internships/${trackId}/pdfs`);

export const uploadTrackPdf = (trackId: string, file: File, title?: string) => {
  const form = new FormData();
  form.append("file", file);
  if (title) form.append("title", title);
  return fetch(`${getBase()}/internships/${trackId}/pdfs`, {
    method: "POST",
    credentials: "include",
    body: form,
    // No Content-Type header — browser sets multipart/form-data with boundary
  }).then(async (res) => {
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { message?: string }).message || `HTTP ${res.status}`);
    }
    return res.json() as Promise<{ data: PdfMaterial }>;
  });
};

export const replaceTrackPdf = (
  trackId: string,
  pdfId: string,
  file: File,
  title?: string
) => {
  const form = new FormData();
  form.append("file", file);
  if (title) form.append("title", title);
  return fetch(`${getBase()}/internships/${trackId}/pdfs/${pdfId}`, {
    method: "PUT",
    credentials: "include",
    body: form,
  }).then(async (res) => {
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { message?: string }).message || `HTTP ${res.status}`);
    }
    return res.json() as Promise<{ data: PdfMaterial }>;
  });
};

export const deleteTrackPdf = (trackId: string, pdfId: string) =>
  req<{ message: string }>(`/internships/${trackId}/pdfs/${pdfId}`, { method: "DELETE" });

// ── Helpers ────────────────────────────────────────────────────────────────

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
