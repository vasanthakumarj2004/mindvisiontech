/**
 * lib/adminApi.ts
 * Typed fetch wrapper for all admin API calls.
 * Sends cookies automatically (credentials: 'include').
 */

const BASE_API = () =>
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000/api";

const getBase = () => `${BASE_API()}/admin`;

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${getBase()}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      message?: string;
      errors?: Array<{ msg?: string; path?: string }>;
    };
    const detail = Array.isArray(body.errors)
      ? body.errors
          .map((e) => (e.path ? `${e.path}: ${e.msg}` : e.msg))
          .filter(Boolean)
          .join(", ")
      : null;
    throw new Error(body.message || detail || `HTTP ${res.status}`);
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

export type Subject = {
  _id: string;
  name: string;
  slug: string;
  course: string;
  order: number;
  createdAt: string;
};

export type PdfMaterial = {
  _id: string;
  title: string;
  url: string;
  s3Key: string;
  fileSize: number;
  subject: string;
  uploadedBy: string;
  createdAt: string;
};

export type Student = {
  _id: string;
  name: string;
  course: { _id: string; name: string; slug: string } | string;
  courseFees: number;
  discount: number;
  finalFees: number;
  enrolledAt: string;
  createdAt: string;
};

export type DashboardStats = {
  totalCourses: number;
  totalSubjects: number;
  totalStudents: number;
  totalStudyMaterials: number;
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
  req<{ data: Course }>("/courses", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((r) => r.data);

export const updateAdminCourse = (
  id: string,
  payload: Partial<Course & { thumbnailUrl: string }>
) =>
  req<{ data: Course }>(`/courses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }).then((r) => r.data);

export const deleteAdminCourse = (id: string) =>
  req<{ message: string }>(`/courses/${id}`, { method: "DELETE" });

// ── Subjects ───────────────────────────────────────────────────────────────

export const getCourseSubjects = (courseId: string) =>
  req<{ data: Subject[] }>(`/courses/${courseId}/subjects`).then((r) => r.data);

export const createSubject = (courseId: string, payload: { name: string; order?: number }) =>
  req<{ data: Subject }>(`/courses/${courseId}/subjects`, {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((r) => r.data);

export const updateSubject = (
  courseId: string,
  subjectId: string,
  payload: { name?: string; order?: number }
) =>
  req<{ data: Subject }>(`/courses/${courseId}/subjects/${subjectId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }).then((r) => r.data);

export const deleteSubject = (courseId: string, subjectId: string) =>
  req<{ message: string }>(`/courses/${courseId}/subjects/${subjectId}`, {
    method: "DELETE",
  });

// ── PDFs (Subject-scoped) ──────────────────────────────────────────────────

export const getSubjectPdfs = (subjectId: string) =>
  req<{ data: PdfMaterial[] }>(`/subjects/${subjectId}/pdfs`).then((r) => r.data);

export const uploadSubjectPdf = (subjectId: string, file: File, title?: string) => {
  const form = new FormData();
  form.append("file", file);
  if (title) form.append("title", title);
  return fetch(`${getBase()}/subjects/${subjectId}/pdfs`, {
    method: "POST",
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

export const updateSubjectPdf = (
  subjectId: string,
  pdfId: string,
  file?: File,
  title?: string
) => {
  const form = new FormData();
  if (file) form.append("file", file);
  if (title) form.append("title", title);
  return fetch(`${getBase()}/subjects/${subjectId}/pdfs/${pdfId}`, {
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

export const deleteSubjectPdf = (subjectId: string, pdfId: string) =>
  req<{ message: string }>(`/subjects/${subjectId}/pdfs/${pdfId}`, {
    method: "DELETE",
  });

// ── Students ───────────────────────────────────────────────────────────────

export const getAdminStudents = () =>
  req<{ data: Student[] }>("/students").then((r) => r.data);

export const getAdminStudent = (id: string) =>
  req<{ data: Student }>(`/students/${id}`).then((r) => r.data);

export const createAdminStudent = (payload: {
  name: string;
  course: string;
  courseFees: number;
  discount?: number;
  enrolledAt?: string;
}) =>
  req<{ data: Student }>("/students", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((r) => r.data);

export const updateAdminStudent = (
  id: string,
  payload: Partial<{
    name: string;
    course: string;
    courseFees: number;
    discount: number;
    enrolledAt: string;
  }>
) =>
  req<{ data: Student }>(`/students/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }).then((r) => r.data);

export const deleteAdminStudent = (id: string) =>
  req<{ message: string }>(`/students/${id}`, { method: "DELETE" });

// ── Public Study Material ──────────────────────────────────────────────────

export const getStudyMaterial = () =>
  fetch(`${BASE_API()}/study-material`, {
    credentials: "include",
  }).then(async (res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });

// ── Helpers ────────────────────────────────────────────────────────────────

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
