# Payload Catalog Demo

A small Payload CMS 3 + Next.js 16 project that shows how I set up a content model for a client catalogue: localized collections, hooks and role-based access control. It runs on SQLite, so it starts without any external database.

## What's inside

**Collections** — `src/collections`
- `products` — localized title and rich-text description (EN / DE / UK), category relation, price, draft/published status, admin-only internal notes.
- `categories` — localized title with an auto-generated slug.
- `inquiries` — a public "ask about this product" endpoint.
- `users` — auth with `admin` and `editor` roles; the first user becomes an admin.

**Access control** — `src/access/roles.ts`
- Anonymous visitors read only published products: `read` returns a query constraint instead of `false`, so one endpoint serves both the public site and the editors.
- Editors create and update content; only admins delete.
- Field-level access: `internalNotes` is invisible to editors, and only admins can change roles.
- Inquiries can be created by anyone but read only by staff; a visitor cannot set the inquiry status.

**Hooks**
- `formatSlug` (field hook) builds URL slugs from the localized title and strips diacritics.
- `products.beforeChange` stamps `publishedAt` the first time a product is published; `afterChange` logs the publish event — the place to trigger revalidation or a webhook.
- `inquiries.beforeValidate` normalizes input and rejects bots through a virtual honeypot field.

**Tests** — `tests/access.test.ts` runs the access rules and hooks against a real SQLite database through Payload's Local API.

## Run it

```bash
pnpm install
cp .env.example .env
pnpm dev          # admin at http://localhost:3000/admin
pnpm test
```

Node 20.9+ and pnpm are required.
