# kani.lk

Real Estate Website for Land Buy and Rent — a discovery and direct-contact
marketplace for land and property in the Northern and Eastern provinces of
Sri Lanka. Visitors browse listings and contact the owner directly; there is
no cart, checkout, online payment or public user registration. Everything is
controlled from an admin dashboard.

## Stack

- **Next.js 16** (App Router, TypeScript, Server Components by default)
- **Tailwind CSS v4**
- **MongoDB Atlas** via Mongoose
- **JWT auth** for admins only (`jose`, httpOnly cookies)
- **Nodemailer** for inquiry email
- **Zod + React Hook Form** for validation
- **sharp** for image processing — photos are stored as base64 in MongoDB and
  served as binary through a cached `/api/images/[id]` route (see
  [Section 9 of the build brief](kani-lk-build-brief.md) for why, and the
  rules that keep it fast)

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in MongoDB, SMTP and JWT secrets
npm run seed                 # districts, cities, land types, superadmin, 15 sample listings
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin is at `/admin/login`
using the `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from your `.env.local`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run seed` | Reset and reseed the `kani_*` collections |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

## Project structure

```
src/
  app/            Route groups: (home), (site), admin, api
  components/      ui/ (primitives) · site/ · land/ · admin/
  lib/            db, auth, mail, images, queries, validation, units
  models/         Mongoose schemas
scripts/          seed.ts and its data
```

## Scope

See [CLAUDE.md](CLAUDE.md) for what is in and out of scope for v1, and
[kani-lk-build-brief.md](kani-lk-build-brief.md) for the full product brief.
