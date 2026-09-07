"use client";

import { useActionState, useEffect, useState } from "react";

import {
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
import type { BookView } from "@/lib/content";

type Action = (state: ActionState, form: FormData) => Promise<ActionState>;

export function BookForm({ book, action }: { book: BookView; action: Action }) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, {
    status: "idle",
    message: "",
  });
  const toast = useToast();

  // Publication fields are revealed only when the book is actually published,
  // which mirrors exactly what the public site will show.
  const [status, setStatus] = useState(book.publicationStatus);
  const published = status === "published";

  useEffect(() => {
    if (state.status === "success") toast.push({ tone: "success", message: state.message });
    if (state.status === "error") toast.push({ tone: "error", message: state.message });
  }, [state, toast]);

  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormBanner status={state.status} message={state.message} />

      <Panel title="The book" description="These fields drive the home page and the book page.">
        <div className="grid gap-5">
          <TextField
            name="title"
            label="Title"
            required
            defaultValue={book.title}
            error={errors.title}
          />
          <TextField name="subtitle" label="Subtitle" defaultValue={book.subtitle} />
          <TextField
            name="author"
            label="Author"
            required
            defaultValue={book.author}
            error={errors.author}
          />
          <TextAreaField
            name="description"
            label="Short description"
            rows={3}
            maxLength={600}
            defaultValue={book.description}
            hint="Used in the hero, the book panel and as the default search description."
          />
          <TextAreaField
            name="longDescription"
            label="Full description"
            rows={10}
            defaultValue={book.longDescription}
            hint="Leave a blank line between paragraphs. Each block becomes its own paragraph."
          />
        </div>
      </Panel>

      <Panel title="Cover" description="The cover is the main visual anchor of the whole site.">
        <div className="grid gap-5 md:grid-cols-2">
          <ImageField
            name="coverImage"
            label="Cover image"
            folder="products"
            defaultValue={book.coverImage}
            hint="PNG, JPEG, WebP or GIF, up to 8MB. Portrait artwork works best."
          />
          <div className="flex flex-col gap-5">
            <TextField
              name="coverAlt"
              label="Cover description for screen readers"
              defaultValue={book.coverAlt}
              hint="Leave empty to use the title and author automatically."
            />
          </div>
        </div>
      </Panel>

      <Panel
        title="Publication"
        description="While the status is Coming soon, the public site shows no price, no ISBN and no buy buttons anywhere."
      >
        <div className="grid gap-5">
          <SelectField
            name="publicationStatus"
            label="Publication status"
            value={status}
            onChange={(next) => setStatus(next as "coming-soon" | "published")}
            options={[
              { value: "coming-soon", label: "Coming soon" },
              { value: "published", label: "Published" },
            ]}
          />

          {published ? (
            <div className="grid gap-5 border-t border-line pt-5 md:grid-cols-2">
              <TextField
                name="publicationDate"
                label="Publication date"
                type="date"
                defaultValue={book.publicationDate ? book.publicationDate.slice(0, 10) : ""}
              />
              <TextField name="isbn" label="ISBN" defaultValue={book.isbn} />
              <TextField
                name="price"
                label="Price"
                type="number"
                defaultValue={book.price ?? ""}
                error={errors.price}
              />
              <TextField name="currency" label="Currency" defaultValue={book.currency} />
              <TextField
                name="format"
                label="Format"
                defaultValue={book.format}
                hint="For example: Hardcover."
              />
              <TextField
                name="pageCount"
                label="Pages"
                type="number"
                defaultValue={book.pageCount ?? ""}
              />
              <TextField
                name="purchaseUrl"
                label="Primary purchase link"
                type="url"
                defaultValue={book.purchaseUrl}
                error={errors.purchaseUrl}
                className="md:col-span-2"
              />
              <TextField
                name="amazonUrl"
                label="Amazon link"
                type="url"
                defaultValue={book.amazonUrl}
                error={errors.amazonUrl}
                className="md:col-span-2"
              />
              <div className="md:col-span-2">
                <LinkListField
                  name="retailers"
                  label="Other retailers"
                  defaultValue={book.retailers}
                  labelPlaceholder="Retailer name"
                />
              </div>
            </div>
          ) : (
            <>
              {/* Preserve stored commerce values while the book is unpublished
                  so switching to Published does not lose them. */}
              <input type="hidden" name="publicationDate" value={book.publicationDate?.slice(0, 10) ?? ""} readOnly />
              <input type="hidden" name="isbn" value={book.isbn} readOnly />
              <input type="hidden" name="price" value={book.price ?? ""} readOnly />
              <input type="hidden" name="currency" value={book.currency} readOnly />
              <input type="hidden" name="format" value={book.format} readOnly />
              <input type="hidden" name="pageCount" value={book.pageCount ?? ""} readOnly />
              <input type="hidden" name="purchaseUrl" value={book.purchaseUrl} readOnly />
              <input type="hidden" name="amazonUrl" value={book.amazonUrl} readOnly />
              {book.retailers.map((retailer, index) => (
                <span key={`${retailer.url}-${index}`}>
                  <input type="hidden" name="retailers.label" value={retailer.label} readOnly />
                  <input type="hidden" name="retailers.url" value={retailer.url} readOnly />
                </span>
              ))}
              <p className="text-sm leading-relaxed text-fg-muted">
                Price, ISBN, publication date and retailer links are hidden while the book is
                coming soon. Anything already saved is kept and reappears when you switch the
                status to Published.
              </p>
            </>
          )}
        </div>
      </Panel>

      <Panel title="Search and sharing" description="Leave these empty to use the book details above.">
        <div className="grid gap-5 md:grid-cols-2">
          <TextField name="seoTitle" label="Search title" defaultValue={book.seoTitle} />
          <TextField
            name="seoDescription"
            label="Search description"
            defaultValue={book.seoDescription}
          />
          <div className="md:col-span-2">
            <ImageField
              name="ogImage"
              label="Social sharing image"
              folder="pages"
              defaultValue={book.ogImage}
              hint="Shown when the book page is shared. 1200 by 630 pixels works best."
            />
          </div>
        </div>
      </Panel>

      <div className="flex items-center gap-3">
        <SubmitButton>Save the book</SubmitButton>
      </div>
    </form>
  );
}
