import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Admin Panel | MindVisionTech",
  robots: { index: false, follow: false },
};

/**
 * Admin layout for all admin routes.
 * The outer RootLayout provides the HTML and body; PublicChrome automatically
 * suppresses public Header, Footer, FloatingContactButton, and Chatbot for /admin.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 antialiased font-sans">
      {children}
    </div>
  );
}
