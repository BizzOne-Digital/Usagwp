import { PageHeading } from "@/components/admin/page-heading";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSiteSettings } from "@/lib/content";
import { saveSettingsAction } from "./actions";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHeading
        title="Site settings"
        description="Site-wide details and the default search and sharing values used by any page that does not set its own."
        breadcrumbs={[{ href: "/admin", label: "Dashboard" }]}
      />
      <SettingsForm settings={settings} action={saveSettingsAction} />
    </>
  );
}
