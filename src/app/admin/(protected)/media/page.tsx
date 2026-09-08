import { AdminEmptyState, PageHeading } from "@/components/admin/page-heading";
import { MediaLibrary } from "@/components/admin/media-library";
import { safeQuery } from "@/lib/db/mongoose";
import { UPLOAD_FOLDERS, uploadPublicUrl } from "@/lib/uploads/storage";
import { StoredUpload } from "@/models";
import { deleteMediaAction } from "./actions";

type Props = { searchParams: Promise<{ folder?: string; q?: string }> };

export default async function AdminMediaPage({ searchParams }: Props) {
  const { folder, q } = await searchParams;

  const activeFolder =
    folder && (UPLOAD_FOLDERS as readonly string[]).includes(folder) ? folder : "";
  const search = (q ?? "").trim();

  const files = await safeQuery(
    "adminMedia",
    async () => {
      const filter: Record<string, unknown> = {};
      if (activeFolder) filter.folder = activeFolder;
      if (search) {
        // Escaped so a search string can never be interpreted as a pattern.
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.$or = [
          { originalName: { $regex: escaped, $options: "i" } },
          { filename: { $regex: escaped, $options: "i" } },
        ];
      }

      const docs = await StoredUpload.find(filter)
        .select("folder filename mimeType size originalName createdAt")
        .sort({ createdAt: -1 })
        .limit(200)
        .lean();

      return docs.map((doc) => ({
        id: String(doc._id),
        url: uploadPublicUrl(doc.folder, doc.filename),
        folder: doc.folder,
        filename: doc.filename,
        originalName: doc.originalName ?? "",
        mimeType: doc.mimeType,
        size: doc.size,
        createdAt: doc.createdAt ? doc.createdAt.toISOString() : null,
      }));
    },
    null,
  );

  return (
    <>
      <PageHeading
        title="Media library"
        description="Every uploaded file, stored in the database rather than on disk, so nothing is lost when the site is redeployed."
        breadcrumbs={[{ href: "/admin", label: "Dashboard" }]}
      />

      {files === null ? (
        <div className="rounded-sm border border-line bg-bg p-6">
          <p className="text-sm text-fg-muted">
            The database could not be reached, so the media library is unavailable.
          </p>
        </div>
      ) : files.length === 0 && !activeFolder && !search ? (
        <AdminEmptyState
          title="No files have been uploaded yet"
          body="Images uploaded from the book, Author Notes, Family Tree and eBook/Paperback Order editors appear here automatically."
        />
      ) : (
        <MediaLibrary
          files={files}
          folders={[...UPLOAD_FOLDERS]}
          activeFolder={activeFolder}
          search={search}
          deleteAction={deleteMediaAction}
        />
      )}
    </>
  );
}
