"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle, WarningCircle, X } from "@phosphor-icons/react";

type Tone = "success" | "error" | "info";
type Toast = { id: number; tone: Tone; message: string };

type ToastApi = { push: (toast: { tone: Tone; message: string }) => void };

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider.");
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    ({ tone, message }: { tone: Tone; message: string }) => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, tone, message }]);
      window.setTimeout(() => remove(id), 5000);
    },
    [remove],
  );

  const api = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-5 right-5 z-[70] flex w-[min(22rem,calc(100vw-2.5rem))] flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-2.5 rounded-sm border border-line-strong bg-bg-surface px-3.5 py-3 shadow-lg"
          >
            {toast.tone === "error" ? (
              <WarningCircle size={18} className="mt-px shrink-0 text-accent" aria-hidden />
            ) : (
              <CheckCircle size={18} className="mt-px shrink-0 text-brand" aria-hidden />
            )}
            <p className="flex-1 text-sm text-fg">{toast.message}</p>
            <button
              type="button"
              onClick={() => remove(toast.id)}
              className="shrink-0 rounded-sm p-0.5 text-fg-muted transition-colors hover:text-fg"
            >
              <X size={14} aria-hidden />
              <span className="sr-only">Dismiss</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
