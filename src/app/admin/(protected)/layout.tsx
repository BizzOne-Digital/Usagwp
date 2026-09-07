import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminSession } from "@/lib/auth/session";

/**
 * UI-level gate for the dashboard. Every server action and API route re-checks
 * the session independently, so this redirect is a convenience for the operator
 * rather than the security boundary.
 */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell userName={session.name} userEmail={session.email}>
      {children}
    </AdminShell>
  );
}
