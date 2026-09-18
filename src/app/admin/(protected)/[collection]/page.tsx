import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowSquareOut, Plus } from "@phosphor-icons/react/dist/ssr";

import { AdminEmptyState, PageHeading } from "@/components/admin/page-heading";
import { getCollection } from "@/lib/admin/collections";
import { safeQuery } from "@/lib/db/mongoose";
import { togglePublishAction } from "./actions";
import { buttonClasses } from "@/lib/button-classes";

type Props = { params: Promise<{ collection: string }> };

export default async function CollectionListPage({ params }: Props) {
  const { collection: slug } = await params;
  const config = getCollection(slug);
  if (!config) notFound();

  const records = await safeQuery(
    `adminList:${slug}`,
    async () => {
      const docs = await config.model.find({}).sort(config.sort).limit(500).lean();
      return docs.map((doc) => ({
        id: String(doc._id),
        primary: String(doc[config.listPrimary] || "Untitled"),
        secondary: config.listSecondary ? String(doc[config.listSecondary] ?? "") : "",
        published: doc[config.publishField.name] === config.publishField.publishedValue,
        publicPath: config.publicPath ? config.publicPath(doc) : null,
      }));
    },
    null,
  );

  return (
    <>
      <PageHeading
        title={config.plural}
        description={config.description}
        breadcrumbs={[{ href: "/admin", label: "Dashboard" }]}
        actions={
          <Link
            href={`/admin/${config.slug}/new`}
            className={buttonClasses("primary", "md", "px-4")}
          >
            <Plus size={15} aria-hidden />
            Add {config.singular.toLowerCase()}
          </Link>
        }
      />

      {records === null ? (
        <div className="rounded-sm border border-line bg-bg p-6">
          <p className="text-sm text-fg-muted">
            The database could not be reached, so this list cannot be shown right now.
          </p>
        </div>
      ) : records.length === 0 ? (
        <AdminEmptyState
          title={`No ${config.plural.toLowerCase()} yet`}
          body={`Nothing has been added, so the public site shows an empty state rather than placeholder content. Add the first ${config.singular.toLowerCase()} to change that.`}
          action={
            <Link
              href={`/admin/${config.slug}/new`}
              className={buttonClasses("primary", "md", "px-4")}
            >
              <Plus size={15} aria-hidden />
              Add {config.singular.toLowerCase()}
            </Link>
          }
        />
      ) : (
        <ul className="divide-y divide-line rounded-sm border border-line bg-bg">
          {records.map((record) => (
            <li
              key={record.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/${config.slug}/${record.id}`}
                  className="block truncate text-sm font-medium text-fg transition-colors hover:text-brand"
                >
                  {record.primary}
                </Link>
                {record.secondary ? (
                  <p className="mt-0.5 truncate text-sm text-fg-muted">{record.secondary}</p>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={
                    record.published
                      ? "rounded-sm bg-brand/10 px-2 py-1 text-xs font-medium text-brand"
                      : "rounded-sm bg-fg/[0.07] px-2 py-1 text-xs font-medium text-fg-muted"
                  }
                >
                  {record.published ? config.publishField.label : "Hidden"}
                </span>

                {record.published && record.publicPath ? (
                  <Link
                    href={record.publicPath}
                    target="_blank"
                    aria-label={`View ${record.primary} on the site`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-line-strong text-fg-muted transition-colors hover:border-fg hover:text-fg"
                  >
                    <ArrowSquareOut size={15} aria-hidden />
                  </Link>
                ) : null}

                <form action={togglePublishAction}>
                  <input type="hidden" name="__collection" value={config.slug} />
                  <input type="hidden" name="__id" value={record.id} />
                  <input type="hidden" name="__next" value={record.published ? "0" : "1"} />
                  <button
                    type="submit"
                    className={buttonClasses("secondary", "sm")}
                  >
                    {record.published ? "Unpublish" : "Publish"}
                  </button>
                </form>

                <Link
                  href={`/admin/${config.slug}/${record.id}`}
                  className={buttonClasses("secondary", "sm")}
                >
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
