import { coursesData } from "@/data/courses";

export type Course = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  duration: string;
  fees?: number;
  category?: string;
  topics?: string[];
  image?: string;
};

export type Branch = {
  _id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
};

export const fallbackBranches: Branch[] = [
  {
    _id: "1",
    name: "Coimbatore Campus (HQ)",
    city: "Coimbatore",
    address: "SF No 482/1, 4th Floor, Global Tech Park, Hopes, Peelamedu, Coimbatore - 641004",
    phone: "+91 94889 05995",
  },
];

const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";
};

export async function getCourses(): Promise<Course[]> {
  const apiUrl = getApiUrl();
  // If server-side static export or relative URL, return instant local data without network hang
  if (typeof window === "undefined" && (apiUrl.startsWith("/") || process.env.NEXT_OUTPUT_MODE === "export")) {
    return coursesData;
  }

  try {
    const response = await fetch(`${apiUrl}/courses`, {
      signal: AbortSignal.timeout(2000),
      next: { revalidate: 60 },
    });
    if (response.ok) {
      const json = (await response.json()) as { data: Course[] };
      if (Array.isArray(json?.data) && json.data.length > 0) return json.data;
    }
  } catch {
    // Network error or timeout, fallback safely
  }
  return coursesData;
}

export async function getBranches(): Promise<Branch[]> {
  const apiUrl = getApiUrl();
  if (typeof window === "undefined" && (apiUrl.startsWith("/") || process.env.NEXT_OUTPUT_MODE === "export")) {
    return fallbackBranches;
  }

  try {
    const response = await fetch(`${apiUrl}/branches`, {
      signal: AbortSignal.timeout(2000),
      next: { revalidate: 60 },
    });
    if (response.ok) {
      const json = (await response.json()) as { data: Branch[] };
      if (Array.isArray(json?.data) && json.data.length > 0) return json.data;
    }
  } catch {
    // Network error or timeout, fallback safely
  }
  return fallbackBranches;
}

export async function submitLead(payload: Record<string, string>) {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Unable to submit enquiry");
  return response.json();
}