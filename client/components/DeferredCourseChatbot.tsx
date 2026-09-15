"use client";

import dynamic from "next/dynamic";

const CourseChatbot = dynamic(
  () => import("@/components/CourseChatbot").then((module) => module.CourseChatbot),
  { ssr: false, loading: () => null }
);

export function DeferredCourseChatbot() {
  return <CourseChatbot />;
}
