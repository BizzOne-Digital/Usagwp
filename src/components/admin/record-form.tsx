"use client";

import { useActionState, useEffect } from "react";

import {
  CheckboxField,
  FormBanner,
  SelectField,
  SubmitButton,
  TextAreaField,
  TextField,
} from "@/components/admin/form-controls";
import { ImageField } from "@/components/admin/image-field";
import { LinkListField } from "@/components/admin/link-list-field";
import { Panel } from "@/components/admin/page-heading";
import { useToast } from "@/components/admin/toast";
import type { ActionState } from "@/lib/admin/actions";
import type { FieldConfig } from "@/lib/admin/collections";

type Action = (state: ActionState, form: FormData) => Promise<ActionState>;

export type RecordFormProps = {
  collection: string;
  recordId: string;
  fields: FieldConfig[];
  values: Record<string, unknown>;
  action: Action;
  submitLabel: string;
  initialMessage?: string;
};

/** Renders any collection record from its field descriptors. */
export function RecordForm({
  collection,
  recordId,
  fields,
  values,
  action,
  submitLabel,
  initialMessage,
}: RecordFormProps) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, {
    status: initialMessage ? "success" : "idle",
    message: initialMessage ?? "",
  });
  const toast = useToast();

  useEffect(() => {
    if (state.status === "success" && state.message) {
      toast.push({ tone: "success", message: state.message });
    }
    if (state.status === "error") {
      toast.push({ tone: "error", message: state.message });
    }
  }, [state, toast]);

  const errors = state.fieldErrors ?? {};

  // Fields without an explicit group form the first, unnamed panel.
  const groups = new Map<string, FieldConfig[]>();
  for (const field of fields) {
    const key = field.group ?? "";
    const existing = groups.get(key);
    if (existing) existing.push(field);
    else groups.set(key, [field]);
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="__collection" value={collection} />
      <input type="hidden" name="__id" value={recordId} />

      <FormBanner status={state.status} message={state.message} />

      {[...groups.entries()].map(([group, groupFields]) => (
        <Panel key={group || "main"} title={group || undefined}>
          <div className="grid gap-5 md:grid-cols-2">
            {groupFields.map((field) => (
              <Field
                key={field.name}
                field={field}
                value={values[field.name]}
                error={errors[field.name]}
              />
            ))}
          </div>
        </Panel>
      ))}

      <div>
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}

function Field({
  field,
  value,
  error,
}: {
  field: FieldConfig;
  value: unknown;
  error?: string;
}) {
  // Long-form and composite controls take the full width of the two-column grid.
  const spanFull =
    field.full ||
    field.type === "textarea" ||
    field.type === "richtext" ||
    field.type === "links" ||
    field.type === "image";
  const className = spanFull ? "md:col-span-2" : undefined;

  switch (field.type) {
    case "checkbox":
      return (
        <div className={className}>
          <CheckboxField
            name={field.name}
            label={field.label}
            hint={field.hint}
            defaultChecked={Boolean(value)}
          />
        </div>
      );

    case "select":
      return (
        <SelectField
          name={field.name}
          label={field.label}
          hint={field.hint}
          error={error}
          className={className}
          defaultValue={value === undefined || value === null ? undefined : String(value)}
          options={field.options ?? []}
        />
      );

    case "image":
      return (
        <div className={className}>
          <ImageField
            name={field.name}
            label={field.label}
            hint={field.hint}
            folder={field.folder ?? "misc"}
            defaultValue={typeof value === "string" ? value : ""}
          />
        </div>
      );

    case "links":
      return (
        <div className={className}>
          <LinkListField
            name={field.name}
            label={field.label}
            hint={field.hint}
            defaultValue={
              Array.isArray(value) ? (value as { label: string; url: string }[]) : []
            }
          />
        </div>
      );

    case "textarea":
    case "richtext":
      return (
        <TextAreaField
          name={field.name}
          label={field.label}
          hint={field.hint}
          error={error}
          required={field.required}
          rows={field.rows ?? (field.type === "richtext" ? 10 : 4)}
          className={className}
          defaultValue={typeof value === "string" ? value : ""}
        />
      );

    default:
      return (
        <TextField
          name={field.name}
          label={field.label}
          hint={field.hint}
          error={error}
          required={field.required}
          type={field.type}
          className={className}
          defaultValue={
            value === undefined || value === null ? "" : (value as string | number)
          }
        />
      );
  }
}
