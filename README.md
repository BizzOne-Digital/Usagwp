# USAGWP

The website and content management system for **One Thread in the Fabric of Freedom**, the
forthcoming book by Peter Douet telling the true story of Reverend Edmond Kelly.

The site is currently a **pre-publication** experience. The book is in its final stage before
printing, so nothing on the public site offers it for sale. The architecture is already built
for the switch: changing one setting in the admin turns on price, ISBN, publication date and
buy buttons across the whole site with no code change and no redesign.

---

## Tech stack

| Concern        | Choice                                                     |
| -------------- | ---------------------------------------------------------- |
| Framework      | Next.js 15 (App Router, React Server Components)           |
| Language       | TypeScript, strict                                         |
| Styling        | Tailwind CSS v4, with a token layer in `src/app/globals.css` |
| Database       | MongoDB via Mongoose                                       |
| Auth           | Signed, HTTP-only session cookie (`jose` + `bcryptjs`)     |
| Validation     | Zod, on the client and again on the server                 |
| Icons          | Phosphor Icons                                             |
| Type           | EB Garamond (display) and Geist (body and UI), via `next/font` |

There is no animation library. The two pieces of motion on the site are a CSS transition and a
small `requestAnimationFrame` counter, both of which degrade to the finished state.

---

## Getting started

```bash
npm install
cp .env.example .env.local     # then fill in the values
npm run seed:admin -- "you@example.com" "a-long-password" "Your Name"
npm run seed:content
npm run dev
```

The public site is at `http://localhost:3000` and the CMS at `http://localhost:3000/admin`.

### Environment variables

| Variable               | Required | Purpose                                                                 |
| ---------------------- | -------- | ----------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | yes      | Canonical origin. Drives canonical tags, Open Graph, `robots.txt`, sitemap. No trailing slash. |
| `MONGODB_URI`          | yes      | Connection string. Holds all content **and** all uploaded images.        |
| `ADMIN_SESSION_SECRET` | yes      | Signing key for the admin session cookie. 32 characters minimum.         |

Generate a session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Never commit `.env.local`. Never hardcode the production domain: everything reads
`NEXT_PUBLIC_SITE_URL`.

### Scripts

| Command                | What it does                                                     |
| ---------------------- | ---------------------------------------------------------------- |
| `npm run dev`          | Development server                                               |
| `npm run build`        | Production build                                                 |
| `npm start`            | Serve the production build                                       |
| `npm run typecheck`    | TypeScript, no emit                                              |
| `npm run lint`         | ESLint                                                           |
| `npm run seed:admin`   | Create or reset an administrator account                         |
| `npm run seed:content` | Create the initial Book record and site settings (idempotent; `--force` overwrites) |

---

## MongoDB setup

Any MongoDB 6 or later will do; Atlas is the straightforward choice for a Vercel deployment.

1. Create a database (the connection string above uses `usagwp`).
2. Create a user with read and write access to it.
3. Allow network access from your deployment. On Atlas with Vercel this means allowing access
   from anywhere (`0.0.0.0/0`) unless you have static egress, since Vercel functions do not
   have fixed IPs.
4. Put the connection string in `MONGODB_URI`.

Indexes are declared on the Mongoose schemas and are created automatically on first connection.

If the database is unreachable, the public site still renders. Read paths go through
`safeQuery`, which logs the failure server-side and falls back to sensible defaults rather
than showing an error page to a reader.

---

## Admin setup

```bash
npm run seed:admin -- "peter@example.com" "a-long-password" "Peter Douet"
```

Running it again for the same address resets that password **and** signs out every existing
session for the account (the account's `tokenVersion` is bumped, which invalidates issued
cookies). Passwords must be at least 12 characters.

Sign in at `/admin`.

### How admin protection works

There are two layers, and only the second one is the security boundary.

1. `src/app/admin/(protected)/layout.tsx` redirects unauthenticated visitors. This is a
   convenience for the operator.
2. **Every** server action and API route independently calls `getAdminSession()` before doing
   any work. Session verification checks the cookie signature *and* re-reads the user from the
   database, so a deleted account or a changed password takes effect immediately.

Never rely on the layout alone when adding a new mutation.

---

## How image uploads work

**Uploaded images are stored in MongoDB, not on the filesystem.**

This is the single most important architectural decision in the project. Serverless hosts give
you an ephemeral, largely read-only filesystem: anything written to `public/uploads` or `/tmp`
disappears on the next deployment or cold start. Storing binaries in the database means the
client's cover art survives every redeploy.

### The flow

1. The admin picks a file in `ImageField` (`src/components/admin/image-field.tsx`).
2. It is posted to `POST /api/upload` as `multipart/form-data` with `file` and `folder`.
3. The route checks authentication, the folder allowlist, the MIME type and the size, then
   generates its own filename (`<timestamp>-<random hex>.<ext>`) and writes a `StoredUpload`
   document holding the bytes.
4. The route returns a public URL such as `/api/uploads/products/1730000000000-a1b2c3.png`.
5. **Only that URL string** is submitted with the form and saved on the content document. The
   binary lives in `StoredUpload` and nowhere else.
6. `GET /api/uploads/[folder]/[filename]` streams the bytes back with a one-year immutable
   cache header. Filenames are never reused, so that is safe.

### Constraints

- Accepted: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Maximum size: 8MB
- Folders: `products`, `gallery`, `pages`, `misc`

All four are enforced on the server. Client-side checks exist only to give faster feedback.

### Replacing and removing

Deletion is handled by `deleteReplacedUpload`, which removes the old file **only when the URL
actually changed**. Saving a form without touching the image never destroys the current file.
Removing an image clears the reference and deletes the stored file. Deleting a record deletes
the images it owned.

Deletion only ever touches URLs beginning with `/api/uploads/`. External URLs and legacy paths
are left alone.

### Legacy and missing images

`resolveImageUrl` (`src/lib/uploads/resolve-image-url.ts`) is the single place that decides
what is renderable. It accepts current upload URLs and absolute external URLs, and returns
`null` for old `/uploads/...` disk paths, empty values and anything malformed. Components then
show their designed no-image state rather than a broken image.

### next/image

Optimisation is left on. `next.config.ts` declares `localPatterns` for `/api/uploads/**`, so
uploaded images are optimised like any other. Image optimisation is never disabled globally
just to make uploads work.

---

## The book, and switching to published

Everything about the book lives on one screen: **Admin → The Book**.

While **Publication status** is `Coming soon`:

- no price, ISBN, publication date, format, page count or retailer link is shown anywhere;
- the calls to action invite readers to join the launch list;
- the book page emits `Book` structured data with no offer and no availability;
- those commercial fields are **stripped server-side before any public page receives them**
  (`withoutUnreleasedDetail` in `src/lib/content.ts`), so an unannounced price or ISBN cannot
  be read out of the page source either.

Switching to `Published` reveals the commercial fields in the editor and, once saved, turns on
the price, the details table, the buy buttons and `Product` structured data with a real offer.
Copy that refers to the book being at the printer changes automatically. Nothing is duplicated
and nothing needs redesigning.

Values entered while the book is unpublished are kept, so you can prepare the price and ISBN in
advance and reveal them by flipping the status.

---

## Content model

| Collection      | Public surface                          |
| --------------- | --------------------------------------- |
| `Book`          | Home page, `/book`                      |
| `Service`       | `/services`, `/services/[slug]`         |
| `TeamMember`    | `/team`                                 |
| `BlogPost`      | `/journal`, `/journal/[slug]`           |
| `Faq`           | `/faq`                                  |
| `Testimonial`   | Available to the site, not yet placed   |
| `Page`          | Per-page SEO overrides                  |
| `SiteSettings`  | Header, footer, default SEO             |
| `Subscriber`    | Launch notification list                |
| `ContactMessage`| Contact form submissions                |
| `StoredUpload`  | Every uploaded file                     |
| `AdminUser`     | CMS accounts                            |

Repeatable types are driven by one declarative registry in `src/lib/admin/collections.ts`,
which generates the list view, the editor, validation and the save, publish and delete actions.
Adding a content type is a config entry, not another set of pages.

**Nothing is invented.** Team members, services, questions and journal entries appear only when
the client adds them. Until then each page shows a composed empty state rather than filler.

### Draft handling

Unpublished records never appear in listings, are never in the sitemap, and their detail pages
render a not-found page carrying `noindex, nofollow`. See the note on 404 status below.

---

## SEO

`src/lib/seo.ts` is the single source.

- `getSiteUrl()` reads `NEXT_PUBLIC_SITE_URL`, falling back to the Vercel-provided host, then
  to localhost. The production domain is never hardcoded.
- `buildMetadata()` produces canonical URLs, hreflang alternates, Open Graph and Twitter cards.
- `generatePageMetadata()` resolves in this order: per-page admin override → the page's own
  default → the global site default.
- `noIndexMetadata()` is ready for `/cart`, `/checkout` and `/account/*` the moment they exist.

Structured data:

- `Organization` and `WebSite` are emitted **once**, in the site layout, so no page can
  duplicate them.
- `LocalBusiness` is deliberately **not** emitted. USAGWP has no public premises or opening
  hours, and claiming otherwise would be misleading markup.
- `/book` emits `Product` with a real offer only when the book is genuinely for sale, and
  `Book` otherwise.
- `/faq` emits `FAQPage` only when there are published questions.
- Journal entries emit `Article`.

`robots.ts` allows the public site and blocks `/admin`, the mutating API routes, and the future
account, cart and checkout routes. `/api/uploads` stays crawlable so cover art and social
images can be fetched. `sitemap.ts` lists public routes plus published services and journal
entries, and excludes drafts, admin and API routes.

Per-page overrides for title, description, sharing image, canonical and indexing live in
**Admin → Pages and SEO**. Empty fields fall back to the page's own well-written default.

### A note on 404 status

Missing and unpublished detail pages render the correct not-found page, but Next.js 15.5
returns HTTP **200** rather than 404 when `notFound()` is called from a page component; only
routes with no matching segment return a true 404. This is framework behaviour, not something
the application can override from page code, and it was verified against a production build.

The practical risk is contained: those pages emit `noindex, nofollow`, so they cannot be
indexed as real pages, and no draft content is served. Worth re-testing on a future Next.js
upgrade, at which point the workaround can be removed from this document.

---

## Accessibility

- Semantic landmarks, a skip link, and visible focus rings on a token-driven `:focus-visible`.
- The mobile menu is a real dialog: `role="dialog"`, `aria-modal`, labelled, focus moved to the
  close button, Escape to dismiss, background scroll locked.
- Destructive actions go through a labelled `alertdialog`, never a bare button.
- Labels sit above inputs. Placeholders are never used as labels. Errors are announced.
- Colour contrast was measured programmatically in both themes; every text element meets WCAG
  AA. Filled buttons use `--brand-contrast` and `--accent-contrast`, which flip per theme so a
  button can never end up light-on-light.
- All motion is gated behind `prefers-reduced-motion` and degrades to the finished state.

### On the entrance animation

`RevealController` is written so that content can never go missing, because the obvious
implementation fails in three separate ways that all blank real text. Each rule below exists
because the naive version was tried and broke:

1. **Nothing is hidden by the stylesheet alone.** The hidden state (`.is-pending`) is only ever
   added by JavaScript. If the script fails, is blocked, or never runs, the page renders
   complete. Server HTML contains no hidden state, so crawlers see the full text.
2. **Only the IntersectionObserver hides anything, and only once it has confirmed the element is
   off screen.** Hiding everything up front and revealing what is in view does not work: the
   first observer callback is asynchronous, so the browser paints the blanked page first and the
   reader watches the text vanish and come back.
3. **It re-arms on every route change.** The controller lives in the shared site layout, which
   is *not* remounted when the router moves between pages. Keyed only to mount, every page
   visited after the first stayed blank until a full reload.

A periodic failsafe rescues anything still hidden that is actually on screen, and leaves
everything else observed so content further down the page keeps its animation.

### On fixed-position elements

The mobile drawer is rendered as a **sibling** of `<header>`, not inside it. The header uses
`backdrop-blur`, and a `backdrop-filter` establishes a containing block for fixed-position
descendants: nested inside, the drawer's `inset-0` resolved to the 64px header box instead of
the viewport, and every nav link was clipped out of sight. Anything `position: fixed` added
later must not sit inside a filtered, transformed, or `will-change`-promoted ancestor.

---

## Design system

All colour, type, spacing, radius and motion tokens live at the top of
`src/app/globals.css`. No component hardcodes a colour.

The palette is ink indigo on a bone paper ground, with a single accent: the crimson thread of
the book's title, used for the thread motif that recurs through the site. One accent, one
radius scale (letterpress-sharp), one type pairing.

### Rebranding to the cover

The client has not yet supplied the final cover, so the palette is a considered placeholder
derived from the book's subject rather than from artwork. When the cover arrives:

1. Open `src/app/globals.css`.
2. Re-derive the values in the `@theme` block and the two dark-mode blocks. That is the whole
   change; nothing downstream needs touching.
3. Upload the cover in **Admin → The Book**. It becomes the anchor of the hero and the book
   panel automatically, replacing the typographic stand-in.

Keep the accent single. The design depends on one thread colour, not several.

### Images still needed

The site deliberately uses no stock photography: for this subject, generic imagery would be
both inauthentic and disrespectful. Its visual weight comes from typography, rule work, paper
texture and the cover itself. To go further, the client should supply:

- the final book cover (the most important asset by far);
- a portrait of Peter Douet, for the team page;
- any authorised archival material relating to Reverend Edmond Kelly.

All three are uploadable through the CMS with no code change.

---

## Deployment (Vercel)

1. Push the repository and import it into Vercel.
2. Set `NEXT_PUBLIC_SITE_URL`, `MONGODB_URI` and `ADMIN_SESSION_SECRET` for Production (and
   Preview, if you use it).
3. Allow database access from Vercel, as described under MongoDB setup.
4. Deploy, then run `npm run seed:admin` and `npm run seed:content` against the production
   database from your own machine.

The application is serverless-safe:

- no persistent local disk is used or assumed;
- the upload and download routes declare the Node runtime, which binary handling requires;
- the Mongoose connection is memoised per warm instance rather than reopened per request;
- an uploaded image survives a redeploy, because it was never on the filesystem.

Public pages revalidate every five minutes, and every admin write additionally calls
`revalidatePath` for the pages it affects, so edits appear immediately rather than after a wait.

---

## Rate limiting

The public forms and the admin login are rate limited per IP by an in-memory sliding window
(`src/lib/rate-limit.ts`). This protects a single warm instance against a burst from one
address, which is what these forms actually need.

It is deliberately not distributed: on a serverless host each instance keeps its own counters
and they reset on cold start. If a hard global limit is ever needed, move the counter to a
shared store; the call sites will not change.

---

## Email

No email provider is configured. Launch-list sign-ups are stored in the `Subscriber` collection
and are visible under **Admin → Subscribers**, and contact submissions are stored and shown
under **Admin → Messages**. The site never tells a reader that a confirmation email has been
sent, because none has. Wiring a provider later is a change to the two API routes and nothing
else.

---

## Known issues

- **`notFound()` returns 200.** Documented above under SEO. Framework behaviour; mitigated with
  `noindex`.
- **npm audit reports a `postcss` advisory** reached through `next`. It is a build-time
  dependency, the fix requires a Next.js 16 major upgrade, and the project does not process
  untrusted CSS. Revisit when upgrading Next.js.
