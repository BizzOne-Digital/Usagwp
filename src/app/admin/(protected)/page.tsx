import Link from "next/link";

import { PageHeading, Panel } from "@/components/admin/page-heading";
import { safeQuery } from "@/lib/db/mongoose";
import { formatShortDate } from "@/lib/format";
import {
  BlogPost,
  Book,
  ContactMessage,
  Faq,
  Service,
  StoredUpload,
  Subscriber,
  TeamMember,
} from "@/models";
import { BOOK_SLUG } from "@/lib/content";

type Stat = { label: string; value: string; detail: string; href: string };

/** Every figure below is a live count. Nothing here is hardcoded. */
async function buildOverview() {
  const [
    book,
    servicesActive,
    servicesTotal,
    teamPublished,
    teamTotal,
    postsPublished,
    postsTotal,
    faqsPublished,
    mediaCount,
    subscriberCount,
    unreadMessages,
    recentMessages,
  ] = await Promise.all([
    Book.findOne({ slug: BOOK_SLUG }).select("publicationStatus coverImage updatedAt").lean(),
    Service.countDocuments({ active: true }),
    Service.countDocuments({}),
    TeamMember.countDocuments({ published: true }),
    TeamMember.countDocuments({}),
    BlogPost.countDocuments({ status: "published" }),
    BlogPost.countDocuments({}),
    Faq.countDocuments({ published: true }),
    StoredUpload.countDocuments({}),
    Subscriber.countDocuments({}),
    ContactMessage.countDocuments({ read: false }),
    ContactMessage.find({}).sort({ createdAt: -1 }).limit(5).select("name subject createdAt read").lean(),
  ]);

  return {
    available: true,
    bookStatus: book?.publicationStatus ?? "coming-soon",
    bookHasCover: Boolean(book?.coverImage),
    bookExists: Boolean(book),
    servicesActive,
    servicesTotal,
    teamPublished,
    teamTotal,
    postsPublished,
    postsTotal,
    faqsPublished,
    mediaCount,
    subscriberCount,
    unreadMessages,
    recentMessages: recentMessages.map((message) => ({
      id: String(message._id),
      name: message.name,
      subject: message.subject ?? "",
      read: Boolean(message.read),
      createdAt: message.createdAt ? message.createdAt.toISOString() : null,
    })),
  };
}

type Overview = Awaited<ReturnType<typeof buildOverview>>;

type OverviewResult = Overview | { available: false };

async function loadOverview(): Promise<OverviewResult> {
  return safeQuery<OverviewResult>("adminOverview", buildOverview, { available: false });
}

export default async function AdminDashboardPage() {
  const data = await loadOverview();

  if (!data.available) {
    return (
      <>
        <PageHeading title="Dashboard" />
        <Panel>
          <p className="text-sm leading-relaxed text-fg-muted">
            The database could not be reached, so live figures are unavailable. Check{" "}
            <code>MONGODB_URI</code> and that the database accepts connections from this
            deployment.
          </p>
        </Panel>
      </>
    );
  }

  const stats: Stat[] = [
    {
      label: "Book status",
      value: data.bookStatus === "published" ? "Published" : "Coming soon",
      detail: data.bookHasCover ? "Cover uploaded" : "No cover uploaded yet",
      href: "/admin/book",
    },
    {
      label: "Author Notes",
      value: String(data.servicesActive),
      detail: `${data.servicesTotal} total, ${data.servicesActive} shown publicly`,
      href: "/admin/author-notes",
    },
    {
      label: "Lineage entries",
      value: String(data.teamPublished),
      detail: `${data.teamTotal} total, ${data.teamPublished} published`,
      href: "/admin/lineage",
    },
    {
      label: "eBook/Paperback Order entries",
      value: String(data.postsPublished),
      detail: `${data.postsTotal} total, ${data.postsPublished} published`,
      href: "/admin/ebook-order",
    },
    {
      label: "Media files",
      value: String(data.mediaCount),
      detail: "Stored in the database",
      href: "/admin/media",
    },
    {
      label: "Subscribers",
      value: String(data.subscriberCount),
      detail: "On the launch notification list",
      href: "/admin/subscribers",
    },
    {
      label: "Unread messages",
      value: String(data.unreadMessages),
      detail: "From the contact form",
      href: "/admin/messages",
    },
    {
      label: "Published questions",
      value: String(data.faqsPublished),
      detail: "Shown on the questions page",
      href: "/admin/faqs",
    },
  ];

  return (
    <>
      <PageHeading
        title="Dashboard"
        description="A live view of what is currently published on the public website."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-sm border border-line bg-bg p-5 transition-colors hover:border-line-strong"
          >
            <p className="text-sm text-fg-muted">{stat.label}</p>
            <p className="mt-2 font-display text-3xl leading-none text-fg">{stat.value}</p>
            <p className="mt-2.5 text-xs leading-relaxed text-fg-muted">{stat.detail}</p>
          </Link>
        ))}
      </div>

      {!data.bookExists ? (
        <div className="mt-6 rounded-sm border border-accent/40 bg-accent/[0.06] p-5">
          <h2 className="font-display text-lg text-fg">Start with the book</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-fg-soft">
            No book record exists yet, so the public site is showing its built-in copy. Open
            the book editor to save the record and upload the cover.
          </p>
          <Link
            href="/admin/book"
            className="mt-4 inline-flex h-10 items-center rounded-sm bg-brand px-4 text-sm font-medium text-brand-contrast transition-colors hover:bg-brand-strong"
          >
            Open the book editor
          </Link>
        </div>
      ) : null}

      <div className="mt-6">
        <Panel title="Recent messages" description="The five most recent contact form submissions.">
          {data.recentMessages.length === 0 ? (
            <p className="text-sm text-fg-muted">No messages have been received yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {data.recentMessages.map((message) => (
                <li key={message.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-fg">{message.name}</p>
                    <p className="truncate text-sm text-fg-muted">
                      {message.subject || "No subject"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {!message.read ? (
                      <span className="rounded-sm bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent-strong">
                        Unread
                      </span>
                    ) : null}
                    <span className="text-xs text-fg-muted">
                      {formatShortDate(message.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/messages"
            className="mt-4 inline-block text-sm font-medium text-brand underline-offset-4 hover:underline"
          >
            View all messages
          </Link>
        </Panel>
      </div>
    </>
  );
}
