import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { companyInfo } from "@/data/company";
import { Header } from "@/components/Header";
import { FloatingContactButton } from "@/components/FloatingContactButton";
import { DeferredCourseChatbot } from "@/components/DeferredCourseChatbot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://mindvisiontech.com"),
  title: `${companyInfo.name} | Embedded Systems, VLSI & AI Training`,
  description: `${companyInfo.tagline}. Build practical technology skills and start your engineering career with ${companyInfo.name}.`,
  alternates: {
    canonical: "https://mindvisiontech.com",
  },
  openGraph: {
    title: `${companyInfo.name} | Embedded Systems, VLSI & AI Training`,
    description: `${companyInfo.tagline}. Build practical technology skills and start your engineering career with ${companyInfo.name}.`,
    url: "https://mindvisiontech.com",
    siteName: companyInfo.name,
    locale: "en_IN",
    type: "website",
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/mindvisiontech-mark.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  verification: {
    google: "PTkv36QjtpsBnsamAa_Hac9LYWIOcXryiEEMxBXbIsk",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: companyInfo.name,
    url: "https://mindvisiontech.com",
    telephone: companyInfo.phone,
    email: companyInfo.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: companyInfo.address.line1,
      addressLocality: companyInfo.address.city,
      addressRegion: companyInfo.address.state,
      postalCode: companyInfo.address.pincode,
      addressCountry: "IN",
    },
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col relative">
        <Header />
        {children}
        <FloatingContactButton />
        <DeferredCourseChatbot />
      </body>
    </html>
  );
}
