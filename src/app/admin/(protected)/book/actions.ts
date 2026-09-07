"use server";

import {
  parseForm,
  readLinkList,
  readString,
  revalidatePublic,
  successState,
  withAdmin,
  type ActionState,
} from "@/lib/admin/actions";
import { BOOK_SLUG } from "@/lib/content";
import { deleteReplacedUpload } from "@/lib/uploads/storage";
import { bookSchema } from "@/lib/validation/schemas";
import { Book } from "@/models";

export async function saveBookAction(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = parseForm(bookSchema, {
    title: readString(form, "title"),
    subtitle: readString(form, "subtitle"),
    author: readString(form, "author"),
    description: readString(form, "description"),
    longDescription: readString(form, "longDescription"),
    coverImage: readString(form, "coverImage"),
    coverAlt: readString(form, "coverAlt"),
    publicationStatus: readString(form, "publicationStatus"),
    publicationDate: readString(form, "publicationDate"),
    isbn: readString(form, "isbn"),
    price: readString(form, "price"),
    currency: readString(form, "currency") || "USD",
    pageCount: readString(form, "pageCount"),
    format: readString(form, "format"),
    purchaseUrl: readString(form, "purchaseUrl"),
    amazonUrl: readString(form, "amazonUrl"),
    retailers: readLinkList(form, "retailers"),
    seoTitle: readString(form, "seoTitle"),
    seoDescription: readString(form, "seoDescription"),
    ogImage: readString(form, "ogImage"),
  });

  if (!parsed.ok) return parsed.state;
  const input = parsed.value;

  const result = await withAdmin(async () => {
    const existing = await Book.findOne({ slug: BOOK_SLUG }).select("coverImage ogImage").lean();

    await Book.updateOne(
      { slug: BOOK_SLUG },
      {
        $set: {
          slug: BOOK_SLUG,
          title: input.title,
          subtitle: input.subtitle,
          author: input.author,
          description: input.description,
          longDescription: input.longDescription,
          coverImage: input.coverImage,
          coverAlt: input.coverAlt,
          publicationStatus: input.publicationStatus,
          publicationDate: input.publicationDate ? new Date(input.publicationDate) : null,
          isbn: input.isbn,
          price: input.price === "" ? null : Number(input.price),
          currency: input.currency || "USD",
          pageCount: input.pageCount === "" ? null : Number(input.pageCount),
          format: input.format,
          purchaseUrl: input.purchaseUrl,
          amazonUrl: input.amazonUrl,
          retailers: input.retailers,
          seoTitle: input.seoTitle,
          seoDescription: input.seoDescription,
          ogImage: input.ogImage,
        },
      },
      { upsert: true },
    );

    // Only remove the old file once the new reference is safely persisted, and
    // only when the image genuinely changed.
    await deleteReplacedUpload(existing?.coverImage, input.coverImage);
    await deleteReplacedUpload(existing?.ogImage, input.ogImage);
  });

  if (!result.ok) return result.state;

  revalidatePublic(["/book", "/about"]);
  return successState("The book has been saved.");
}
