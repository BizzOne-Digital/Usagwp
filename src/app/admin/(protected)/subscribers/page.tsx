import { AdminEmptyState, PageHeading } from "@/components/admin/page-heading";
import { safeQuery } from "@/lib/db/mongoose";
import { formatShortDate } from "@/lib/format";
import { Subscriber } from "@/models";

export default async function AdminSubscribersPage() {
  const subscribers = await safeQuery(
    "adminSubscribers",
    async () => {
      const docs = await Subscriber.find({}).sort({ createdAt: -1 }).limit(1000).lean();
      return docs.map((doc) => ({
        id: String(doc._id),
        email: doc.email,
        firstName: doc.firstName ?? "",
        createdAt: doc.createdAt ? doc.createdAt.toISOString() : null,
      }));
    },
    null,
  );

  return (
    <>
      <PageHeading
        title="Subscribers"
        description="People waiting to be told the book is available. No email is sent automatically: this is the list to export when you are ready to announce."
        breadcrumbs={[{ href: "/admin", label: "Dashboard" }]}
      />

      {subscribers === null ? (
        <div className="rounded-sm border border-line bg-bg p-6">
          <p className="text-sm text-fg-muted">
            The database could not be reached, so the list is unavailable.
          </p>
        </div>
      ) : subscribers.length === 0 ? (
        <AdminEmptyState
          title="Nobody has signed up yet"
          body="Sign-ups from the Stay Updated form on the public site appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-sm border border-line bg-bg">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <caption className="sr-only">Launch notification list</caption>
            <thead>
              <tr className="border-b border-line text-left">
                <th scope="col" className="px-5 py-3 font-medium text-fg-muted">
                  Email
                </th>
                <th scope="col" className="px-5 py-3 font-medium text-fg-muted">
                  First name
                </th>
                <th scope="col" className="px-5 py-3 font-medium text-fg-muted">
                  Signed up
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id}>
                  <td className="px-5 py-3 text-fg">
                    <a
                      href={`mailto:${subscriber.email}`}
                      className="underline-offset-4 hover:text-brand hover:underline"
                    >
                      {subscriber.email}
                    </a>
                  </td>
                  <td className="px-5 py-3 text-fg-muted">{subscriber.firstName || "-"}</td>
                  <td className="px-5 py-3 text-fg-muted">
                    {formatShortDate(subscriber.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
