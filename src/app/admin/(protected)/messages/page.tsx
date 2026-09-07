import { AdminEmptyState, PageHeading } from "@/components/admin/page-heading";
import { safeQuery } from "@/lib/db/mongoose";
import { formatLongDate } from "@/lib/format";
import { ContactMessage } from "@/models";
import { deleteMessageAction, markMessageReadAction } from "./actions";
import { buttonClasses } from "@/lib/button-classes";

export default async function AdminMessagesPage() {
  const messages = await safeQuery(
    "adminMessages",
    async () => {
      const docs = await ContactMessage.find({}).sort({ createdAt: -1 }).limit(200).lean();
      return docs.map((doc) => ({
        id: String(doc._id),
        name: doc.name,
        email: doc.email,
        phone: doc.phone ?? "",
        subject: doc.subject ?? "",
        message: doc.message,
        read: Boolean(doc.read),
        createdAt: doc.createdAt ? doc.createdAt.toISOString() : null,
      }));
    },
    null,
  );

  return (
    <>
      <PageHeading
        title="Messages"
        description="Everything sent through the contact form on the public site."
        breadcrumbs={[{ href: "/admin", label: "Dashboard" }]}
      />

      {messages === null ? (
        <div className="rounded-sm border border-line bg-bg p-6">
          <p className="text-sm text-fg-muted">
            The database could not be reached, so messages cannot be shown right now.
          </p>
        </div>
      ) : messages.length === 0 ? (
        <AdminEmptyState
          title="No messages yet"
          body="Anything sent through the contact form will appear here."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {messages.map((message) => (
            <li
              key={message.id}
              className="rounded-sm border border-line bg-bg p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-fg">
                    {message.name}
                    {!message.read ? (
                      <span className="ml-2 rounded-sm bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent-strong">
                        Unread
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-sm text-fg-muted">
                    <a
                      href={`mailto:${message.email}`}
                      className="underline-offset-4 hover:text-fg hover:underline"
                    >
                      {message.email}
                    </a>
                    {message.phone ? ` · ${message.phone}` : ""}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-fg-muted">
                  {formatLongDate(message.createdAt)}
                </p>
              </div>

              {message.subject ? (
                <p className="mt-4 text-sm font-medium text-fg">{message.subject}</p>
              ) : null}
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-fg-soft">
                {message.message}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <form action={markMessageReadAction}>
                  <input type="hidden" name="id" value={message.id} />
                  <input type="hidden" name="read" value={message.read ? "0" : "1"} />
                  <button
                    type="submit"
                    className={buttonClasses("secondary", "sm")}
                  >
                    {message.read ? "Mark unread" : "Mark read"}
                  </button>
                </form>
                <a
                  href={`mailto:${message.email}${
                    message.subject ? `?subject=${encodeURIComponent(`Re: ${message.subject}`)}` : ""
                  }`}
                  className={buttonClasses("secondary", "sm")}
                >
                  Reply by email
                </a>
                <form action={deleteMessageAction}>
                  <input type="hidden" name="id" value={message.id} />
                  <button
                    type="submit"
                    className={buttonClasses("secondary", "sm", "text-fg-muted hover:border-accent hover:text-accent")}
                  >
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
