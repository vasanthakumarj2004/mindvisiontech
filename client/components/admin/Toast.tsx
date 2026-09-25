"use client";

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

type Variant = "success" | "error" | "info";

interface ToastProps {
  message: string;
  variant?: Variant;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, variant = "info", onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  const styles: Record<Variant, string> = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-brand-blue/20 text-brand-blue",
  };

  const icons: Record<Variant, React.ReactNode> = {
    success: <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />,
    error: <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />,
    info: <Info className="h-4 w-4 text-brand-blue shrink-0" />,
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-md text-sm font-semibold ${styles[variant]} animate-fade-up`}
    >
      {icons[variant]}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── useToast hook ────────────────────────────────────────────────────────────

type ToastState = { message: string; variant: Variant; id: number } | null;

export function useToast() {
  const [toast, setToast] = useState<ToastState>(null);

  function show(message: string, variant: Variant = "info") {
    setToast({ message, variant, id: Date.now() });
  }

  function dismiss() {
    setToast(null);
  }

  const ToastUI = toast ? (
    <div className="fixed bottom-6 right-6 z-50 w-80 max-w-[calc(100vw-2rem)]">
      <Toast key={toast.id} message={toast.message} variant={toast.variant} onClose={dismiss} />
    </div>
  ) : null;

  return { show, dismiss, ToastUI };
}
