import Link from "next/link";
import { notFound } from "next/navigation";

import { DeleteRecordButton } from "@/components/admin/delete-record-button";
import { PageHeading } from "@/components/admin/page-heading";
import { RecordForm } from "@/components/admin/record-form";
import { getCollection } from "@/lib/admin/collections";
import { safeQuery } from "@/lib/db/mongoose";
import { deleteRecordAction, saveRecordAction } from "../actions";
import { buttonClasses } from "@/lib/button-classes";

type Props = {
  params: Promise<{ collection: string; id: string }>;
  searchParams: Promise<{ created?: string }>;
};

/** Serialises a Mongoose document into plain values the client form can render. */
function toFormValues(
  doc: Record<string, unknown>,
  fields: { name: string; type: string }[],
): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of fields) {
    const raw = doc[field.name];
    if (field.type === "date") {
      values[field.name] = raw instanceof Date ? raw.toISOString().slice(0, 10) : "";
    } else if (field.type === "links") {
      values[field.name] = Array.isArray(raw)
        ? raw.map((entry) => ({
            label: String((entry as { label?: string }).label ?? ""),
            url: String((entry as { url?: string }).url ?? ""),
          }))
        : [];
    } else if (raw === undefined || raw === null) {
      values[field.name] = field.type === "checkbox" ? false : "";
    } else {
      values[field.name] = raw as string | number | boolean;
    }
  }
  return values;
}

export default async function CollectionRecordPage({ params, searchParams }: Props) {
  const [{ collection: slug, id }, query] = await Promise.all([params, searchParams]);

  const config = getCollection(slug);
  if (!config) notFound();

  const isNew = id === "new";

  const record = isNew
    ? null
    : await safeQuery(
        `adminRecord:${slug}:${id}`,
        async () => {
          const doc = await config.model.findById(id).lean();
          return doc ? (doc as Record<string, unknown>) : null;
        },
        null,
      );

  if (!isNew && !record) notFound();

  const values = record
    ? toFormValues(record, config.fields)
    : Object.fromEntries(
        config.fields.map((field) => [
          field.name,
          field.type === "checkbox" ? false : field.type === "links" ? [] : "",
        ]),
      );

  const title = isNew
    ? `New ${config.singular.toLowerCase()}`
    : String(record?.[config.listPrimary] || config.singular);

  return (
    <>
      <PageHeading
        title={title}
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: `/admin/${config.slug}`, label: config.plural },
        ]}
        actions={
          <>
            <Link
              href={`/admin/${config.slug}`}
              className={buttonClasses("secondary", "md", "px-4")}
            >
              Back to {config.plural.toLowerCase()}
            </Link>
            {!isNew ? (
              <DeleteRecordButton
                collection={config.slug}
                recordId={id}
                label={config.singular}
                action={deleteRecordAction}
              />
            ) : null}
          </>
        }
      />

      <RecordForm
        collection={config.slug}
        recordId={isNew ? "new" : id}
        fields={config.fields}
        values={values}
        action={saveRecordAction}
        submitLabel={isNew ? `Create ${config.singular.toLowerCase()}` : "Save changes"}
        initialMessage={query.created ? `${config.singular} created.` : undefined}
      />
    </>
  );
}
