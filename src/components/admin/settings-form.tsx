"use client";

import { useActionState, useEffect } from "react";

import {
  FormBanner,
  SubmitButton,
  TextAreaField,
  TextField,
} from "@/components/admin/form-controls";
import { ImageField } from "@/components/admin/image-field";
import { LinkListField } from "@/components/admin/link-list-field";
import { Panel } from "@/components/admin/page-heading";
import { useToast } from "@/components/admin/toast";
import type { ActionState } from "@/lib/admin/actions";
import type { SiteSettingsView } from "@/lib/content";

type Action = (state: ActionState, form: FormData) => Promise<ActionState>;

export function SettingsForm({
  settings,
  action,
}: {
  settings: SiteSettingsView;
  action: Action;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, {
    status: "idle",
    message: "",
  });
  const toast = useToast();

  useEffect(() => {
    if (state.status === "success") toast.push({ tone: "success", message: state.message });
    if (state.status === "error") toast.push({ tone: "error", message: state.message });
  }, [state, toast]);

  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormBanner status={state.status} message={state.message} />

      <Panel title="Identity">
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            name="siteName"
            label="Site name"
            required
            defaultValue={settings.siteName}
            error={errors.siteName}
          />
          <TextField
            name="tagline"
            label="Tagline"
            defaultValue={settings.tagline}
            hint="Shown in the footer under the mark."
          />
          <TextAreaField
            name="siteDescription"
            label="Site description"
            rows={3}
            defaultValue={settings.siteDescription}
            className="md:col-span-2"
          />
          <ImageField
            name="logo"
            label="Logo"
            folder="misc"
            defaultValue={settings.logo}
            hint="Optional. The built-in mark is used when this is empty."
          />
          <ImageField name="favicon" label="Favicon" folder="misc" defaultValue="" />
        </div>
      </Panel>

      <Panel title="Contact">
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            name="email"
            label="Email"
            type="email"
            defaultValue={settings.email}
            error={errors.email}
          />
          <TextField name="phone" label="Phone" defaultValue={settings.phone} />
          <div className="md:col-span-2">
            <LinkListField
              name="socialLinks"
              label="Social links"
              defaultValue={settings.socialLinks}
              labelPlaceholder="Platform name"
              hint="These appear in the footer and in the site's structured data."
            />
          </div>
        </div>
      </Panel>

      <Panel
        title="Default search and sharing"
        description="Used by any page that has no title, description or sharing image of its own."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            name="defaultSeoTitle"
            label="Default search title"
            defaultValue={settings.defaultSeoTitle}
          />
          <TextField
            name="defaultSeoDescription"
            label="Default search description"
            defaultValue={settings.defaultSeoDescription}
          />
          <div className="md:col-span-2">
            <ImageField
              name="defaultOgImage"
              label="Default sharing image"
              folder="pages"
              defaultValue={settings.defaultOgImage}
              hint="1200 by 630 pixels. Leave empty to use the built-in card."
            />
          </div>
        </div>
      </Panel>

      <Panel
        title="Family line"
        description="One image shown at the top of the public LaTanya D. Kelly-Douet Family Line page. Leave it empty and the page shows the entries only."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <ImageField
            name="familyTreeImage"
            label="Family line image"
            folder="pages"
            defaultValue={settings.familyTreeImage}
            hint="JPEG, PNG or WebP, up to 8MB. A wide image reads best."
          />
          <TextField
            name="familyTreeImageAlt"
            label="Image description"
            defaultValue={settings.familyTreeImageAlt}
            hint="Describes the image for screen readers and search engines."
          />
        </div>
      </Panel>

      <Panel title="Footer and analytics">
        <div className="grid gap-5">
          <TextAreaField
            name="footerText"
            label="Footer note"
            rows={3}
            defaultValue={settings.footerText}
          />
          <TextField
            name="analyticsId"
            label="Analytics ID"
            defaultValue=""
            hint="Stored for later use. No analytics script is loaded on the site today."
          />
        </div>
      </Panel>

      <div>
        <SubmitButton>Save settings</SubmitButton>
      </div>
    </form>
  );
}
