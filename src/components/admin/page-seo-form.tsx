"use client";

import { useActionState, useEffect } from "react";

import {
  CheckboxField,
  FormBanner,
  SubmitButton,
  TextField,
} from "@/components/admin/form-controls";
import { ImageField } from "@/components/admin/image-field";
import { useToast } from "@/components/admin/toast";
import type { ActionState } from "@/lib/admin/actions";

type Values = {
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  canonicalOverride: string;
  noIndex: boolean;
};

export function PageSeoForm({
  pageKey,
  values,
  action,
}: {
  pageKey: string;
  values: Values;
  action: (state: ActionState, form: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, {
    status: "idle",
    message: "",
  });
  const toast = useToast();

  useEffect(() => {
    if (state.status === "success") {
      toast.push({ tone: "success", message: `${pageKey} page saved.` });
    }
    if (state.status === "error") toast.push({ tone: "error", message: state.message });
  }, [state, toast, pageKey]);

  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="key" value={pageKey} />
      <FormBanner status={state.status} message={state.message} />

      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          name="seoTitle"
          label="Search title"
          defaultValue={values.seoTitle}
          error={errors.seoTitle}
        />
        <TextField
          name="seoDescription"
          label="Search description"
          defaultValue={values.seoDescription}
          error={errors.seoDescription}
        />
        <TextField
          name="canonicalOverride"
          label="Canonical address override"
          type="url"
          defaultValue={values.canonicalOverride}
          error={errors.canonicalOverride}
          hint="Only needed if this page duplicates content published elsewhere."
        />
        <div className="flex items-end pb-2">
          <CheckboxField
            name="noIndex"
            label="Hide this page from search engines"
            defaultChecked={values.noIndex}
          />
        </div>
        <div className="md:col-span-2">
          <ImageField
            name="ogImage"
            label="Sharing image"
            folder="pages"
            defaultValue={values.ogImage}
          />
        </div>
      </div>

      <div>
        <SubmitButton>Save this page</SubmitButton>
      </div>
    </form>
  );
}
