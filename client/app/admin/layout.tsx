import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist } from "next/font/google";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Panel | MindVisionTech",
  robots: { index: false, follow: false },
};

/**
 * Admin layout is completely isolated from the public layout.
 * No Header, Footer, Chatbot, or FloatingContactButton.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full bg-gray-50 antialiased">{children}</body>
    </html>
  );
}
