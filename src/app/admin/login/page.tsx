import { redirect } from "next/navigation";

import { BrandMark } from "@/components/ui/brand-mark";
import { LoginForm } from "@/components/admin/login-form";
import { getAdminSession } from "@/lib/auth/session";
import { isDatabaseConfigured } from "@/lib/db/mongoose";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  const configured = isDatabaseConfigured();

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-bg-deep px-5 py-14">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5">
          <BrandMark className="h-7 w-7 text-brand" />
          <span className="font-display text-lg font-semibold tracking-[0.16em] text-fg">
            USAGWP
          </span>
        </div>

        <h1 className="font-display text-3xl font-medium text-fg">Sign in</h1>
        <p className="mt-2 text-sm text-fg-muted">
          This area manages the content of the public website.
        </p>

        <div className="mt-7 rounded-sm border border-line bg-bg p-6">
          {configured ? (
            <LoginForm />
          ) : (
            <p className="text-sm leading-relaxed text-fg-muted">
              The database is not configured yet. Set <code>MONGODB_URI</code> and{" "}
              <code>ADMIN_SESSION_SECRET</code> in the environment, then run the admin seed
              script described in the README.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
