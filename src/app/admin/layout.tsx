import type { Metadata } from "next";

import { ToastProvider } from "@/components/admin/toast";

/** The admin area is never rendered statically and never indexed. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
