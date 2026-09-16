import { getCourses, type Course } from "@/lib/api";
import { coursesData } from "@/data/courses";

export const fallbackCourses: Course[] = coursesData;

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  try {
    const response = await fetch(`${apiUrl}/courses/${slug}`, { next: { revalidate: 60 } });
    if (response.ok) return ((await response.json()) as { data: Course }).data;
  } catch { }
  try {
    return (await getCourses()).find((item) => item.slug === slug) ?? null;
  } catch {
    return fallbackCourses.find((item) => item.slug === slug) ?? null;
  }
}