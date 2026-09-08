import { PageHeading, Panel } from "@/components/admin/page-heading";
import { PageSeoForm } from "@/components/admin/page-seo-form";
import { safeQuery } from "@/lib/db/mongoose";
import { Page } from "@/models";
import { savePageSeoAction } from "./actions";

/**
 * The public pages are hand-designed rather than block-assembled, so this screen
 * manages what an editor genuinely needs to control on them: the title and
 * description search engines show, the sharing image, and indexing.
 */
const MANAGED_PAGES = [
  { key: "home", title: "Home", path: "/" },
  { key: "book", title: "The Book", path: "/book" },
  { key: "about", title: "About", path: "/about" },
  { key: "team", title: "Family Tree", path: "/family-tree" },
  { key: "services", title: "Author Notes", path: "/author-notes" },
  { key: "journal", title: "eBook/Paperback Order", path: "/ebook-order" },
  { key: "faq", title: "Questions", path: "/faq" },
  { key: "contact", title: "Contact", path: "/contact" },
  { key: "privacy", title: "Privacy Policy", path: "/privacy" },
  { key: "terms", title: "Terms", path: "/terms" },
] as const;

export default async function AdminPagesPage() {
  const overrides = await safeQuery(
    "adminPageSeo",
    async () => {
      const docs = await Page.find({ key: { $in: MANAGED_PAGES.map((p) => p.key) } }).lean();
      return Object.fromEntries(
        docs.map((doc) => [
          doc.key,
          {
            seoTitle: doc.seoTitle ?? "",
            seoDescription: doc.seoDescription ?? "",
            ogImage: doc.ogImage ?? "",
            canonicalOverride: doc.canonicalOverride ?? "",
            noIndex: Boolean(doc.noIndex),
          },
        ]),
      );
    },
    {} as Record<
      string,
      {
        seoTitle: string;
        seoDescription: string;
        ogImage: string;
        canonicalOverride: string;
        noIndex: boolean;
      }
    >,
  );

  return (
    <>
      <PageHeading
        title="Pages and SEO"
        description="Override the title, description and sharing image for any public page. Leave a field empty and the page keeps its own well-written default."
        breadcrumbs={[{ href: "/admin", label: "Dashboard" }]}
      />

      <div className="flex flex-col gap-4">
        {MANAGED_PAGES.map((page) => (
          <Panel key={page.key} title={page.title} description={page.path}>
            <PageSeoForm
              pageKey={page.key}
              values={
                overrides[page.key] ?? {
                  seoTitle: "",
                  seoDescription: "",
                  ogImage: "",
                  canonicalOverride: "",
                  noIndex: false,
                }
              }
              action={savePageSeoAction}
            />
          </Panel>
        ))}
      </div>
    </>
  );
}
