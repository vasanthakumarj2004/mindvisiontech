export type Course = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  duration: string;
  fees: number;
  category?: string;
  topics?: string[];
  image?: string;
};
export type Branch = { _id: string; name: string; city: string; address: string; phone: string };
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export async function getCourses(): Promise<Course[]> { const response = await fetch(`${apiUrl}/courses`, { next: { revalidate: 60 } }); if (!response.ok) throw new Error("Unable to load courses"); return ((await response.json()) as { data: Course[] }).data; }
export async function getBranches(): Promise<Branch[]> { const response = await fetch(`${apiUrl}/branches`, { next: { revalidate: 60 } }); if (!response.ok) throw new Error("Unable to load branches"); return ((await response.json()) as { data: Branch[] }).data; }
export async function submitLead(payload: Record<string, string>) { const response = await fetch(`${apiUrl}/leads`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); if (!response.ok) throw new Error("Unable to submit enquiry"); return response.json(); }