"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { FloatingContactButton } from "@/components/FloatingContactButton";
import { DeferredCourseChatbot } from "@/components/DeferredCourseChatbot";

export function PublicChrome() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return null;
  }

  return (
    <>
      <Header />
      <FloatingContactButton />
      <DeferredCourseChatbot />
    </>
  );
}
