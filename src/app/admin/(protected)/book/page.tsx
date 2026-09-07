import Link from "next/link";

import { BookForm } from "@/components/admin/book-form";
import { PageHeading } from "@/components/admin/page-heading";
import { getBookForAdmin } from "@/lib/content";
import { saveBookAction } from "./actions";
import { buttonClasses } from "@/lib/button-classes";

export default async function AdminBookPage() {
  const book = await getBookForAdmin();

  return (
    <>
      <PageHeading
        title="The Book"
        description="Everything the public site knows about One Thread in the Fabric of Freedom. Switching the publication status to Published turns on price, ISBN and buy buttons across the whole site."
        breadcrumbs={[{ href: "/admin", label: "Dashboard" }]}
        actions={
          <Link
            href="/book"
            target="_blank"
            className={buttonClasses("secondary", "md", "px-4")}
          >
            View the book page
          </Link>
        }
      />
      <BookForm book={book} action={saveBookAction} />
    </>
  );
}
