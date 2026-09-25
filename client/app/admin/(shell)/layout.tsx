import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

/**
 * Shell layout for all authenticated admin pages.
 * Provides the sidebar + main content area.
 * Placed at (admin)/ so it's a route group that shares the outer admin layout.
 */
export default function AdminShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 lg:ml-0 pt-14 lg:pt-0 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
