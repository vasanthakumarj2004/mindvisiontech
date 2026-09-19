import { type Course } from "@/lib/api";
import { coursesData } from "@/data/courses";

export const fallbackCourses: Course[] = coursesData;

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const localCourse = fallbackCourses.find((item) => item.slug === slug) ?? null;

  // During static export prerendering, return local course immediately (prevents 60-second build hang)
  if (typeof window === "undefined" && process.env.NEXT_OUTPUT_MODE === "export") {
    return localCourse;
  }

  const rawUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

  // If on server and URL is a relative path (e.g. "/api"), return local data directly
  if (typeof window === "undefined" && rawUrl.startsWith("/")) {
    return localCourse;
  }

  try {
    const response = await fetch(`${rawUrl}/courses/${slug}`, {
      signal: AbortSignal.timeout(2000),
      next: { revalidate: 60 },
    });
    if (response.ok) {
      const json = (await response.json()) as { data: Course };
      if (json?.data) return json.data;
    }
  } catch {
    // Network failure or timeout, fallback safely
  }

  return localCourse;
}