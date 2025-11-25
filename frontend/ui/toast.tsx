import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Toast, useToast } from "@/ui/use-toast";
import { Button } from "@/ui/button";

const toastVariants = cva("pointer-events-auto relative flex w-full items-center justify-between space-x-3 rounded-2xl border p-4 shadow-card", {
  variants: {
    variant: {
      default: "border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

export function ToastItem({ toast }: { toast: Toast }) {
  return (
    <div className={cn(toastVariants({}))}>
      <div className="space-y-1">
        {toast.title && <p className="text-sm font-semibold">{toast.title}</p>}
        {toast.description && <p className="text-sm text-slate-500 dark:text-slate-400">{toast.description}</p>}
        {toast.action}
      </div>
      <Button variant="ghost" size="icon" onClick={toast.dismiss} aria-label="Close">
        ×
      </Button>
    </div>
  );
}

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="flex w-full max-w-md flex-col gap-3">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={{ ...toast, dismiss: () => dismiss(toast.id) }} />
        ))}
      </div>
    </div>
  );
}
