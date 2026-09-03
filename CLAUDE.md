@AGENTS.md

# kani.lk — project scope

kani.lk is a **discovery and direct-contact marketplace**, not a transactional
platform. Read this before adding any feature that sounds like it belongs on
a typical marketplace — most of them are explicitly out of scope, and the
right move is to stop and ask rather than build them.

## In scope (v1)

- Public site: home, `/lands` browse+filter, `/lands/[slug]` detail, `/districts`,
  `/for-sale`, `/for-rent`, about/contact/terms/privacy, `/favourites`
  (device-local, no login)
- Search and filtering by district, city, land type, purpose, price, size,
  deed type, road access, utilities — server-side, URL-driven
- Listing detail: image gallery, full specification, direct contact (call,
  WhatsApp `wa.me` link, enquiry form)
- Admin dashboard: listing CRUD, image management, publish/unpublish,
  featured/popular, districts/cities/land-types CRUD, homepage content,
  inquiries inbox
- Inquiry form → saved to Mongo first, then emailed (admin notification +
  enquirer acknowledgement), fire-and-forget outside the request path
- Basic SEO (per-listing metadata, JSON-LD, sitemap), SSL, deployment

## Explicitly OUT of scope — stop and ask before building any of these

- **Public user accounts** of any kind. No sign-up, no owner/agent portals, no
  "my account". The only login in this codebase is `/admin`.
- **Owner/agent self-service listing submission.** Listings are created by an
  admin, not by the public.
- **Payments, checkout, paid listings, subscription plans, featured-listing
  packages.** There is no cart and there never will be in v1.
- **WhatsApp Business API integration.** A plain `wa.me` deep link is in
  scope and already implemented — the paid API is not.
- **Mobile apps, CRM integration, advanced analytics.**

If a request implies one of the above ("let sellers log in and post their own
land", "take a booking deposit", "add a pricing page"), say so explicitly and
ask before writing code — don't quietly build a login system or a payment flow.

## Domain rules that are easy to get wrong

- **Perches are canonical.** Every size is stored as `sizeInPerches` (derived,
  never hand-entered) and displayed in the unit the admin actually chose
  (`sizeUnit` + `sizeValue`). See `src/lib/units.ts`.
- **`pricePerPerch` is derived on save**, in the `Land` schema's `pre("save")`
  hook — never accept it from a form.
- **`purpose: "both"`** means the listing carries a sale price *and* a
  rent+deposit, and the UI must show both. It is not two independent booleans.
- **Featured and Popular are independent flags.** Featured is a hand-picked
  hero rail (max 6). Popular is either manual (`popularRank`, default) or
  automatic (30-day `viewCount`) — see `SiteSettings.popularMode`. Manual
  always wins when set.
- **Sold/rented listings stay published and indexed.** Never delete or
  unpublish on sale — only `status` changes. They appear in their own
  "Recently sold and rented" homepage row (via `showWhenSold`), are excluded
  from Popular/Latest, and are excluded from `/lands` unless "Include sold"
  is on.
- **Districts, cities, and land types are admin-managed collections**, not
  hardcoded constants. Never reference one by a literal string in code —
  resolve by slug through `src/lib/queries.ts`.

## Image pipeline — do not bypass this

Photos are base64 in MongoDB (`kani_images`, one document per photo) but are
**never** sent inline in a page, Server Component, or JSON response except
the sub-1KB `coverThumb` LQIP. Every photo is served through
`GET /api/images/[id]` (immutable cache, ETag, binary body). If you add a new
place that shows a photo, use `imageUrl()` from `src/lib/image-url.ts` (the
client-safe helper — it has no imports and must stay that way, since anything
importing `sharp`/Mongoose into a client component breaks the build) and let
`next/image` point at that URL. Never query `KaniImage` without projecting
`{ data: 0 }` unless you are inside `/api/images/[id]` itself.

## Database note

This MongoDB instance is shared with at least one other application (its
existing collections: `users`, `complaints`, `zones`, `feedbacks`,
`readinessvotes`, `emailotps`, `collectionschedules`). Every kani.lk
collection is prefixed `kani_` specifically to avoid colliding with those —
keep that prefix on any new collection.
