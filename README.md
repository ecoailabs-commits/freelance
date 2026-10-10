# Community Events Board

An admin posts local events (music nights, workshops, food fairs…) and visitors browse them, pick favourite categories, set reminders and design a personal card for each event.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Prisma + SQLite · JWT (`jose`) · `bcryptjs` · `zod` · `motion` (animations) · `sonner` (toasts)

## Setup (about 2 minutes)

Needs **Node.js 18.18+** (tested on Node 24). No database server is needed because SQLite is a file.

```bash
git clone https://github.com/ecoailabs-commits/freelance.git community-events-board
cd community-events-board
npm install                 # also runs `prisma generate`
cp .env.example .env        # Windows (cmd): copy .env.example .env
npm run setup               # creates prisma/dev.db and seeds 15 sample events
npm run dev                 # http://localhost:3000
```

Run `npm run db:seed` any time to reset the events. Seed dates are relative to today, so there are always upcoming and past events.

## Deploying to Netlify

Netlify has no writable disk, so the hosted site uses **Turso** (free hosted SQLite) instead of the local file. Locally nothing changes.

1. Create a free database at https://turso.tech, then copy its **URL** (`libsql://…`) and an **auth token**.
2. In Netlify, go to **Site configuration → Environment variables** and add:
   `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `JWT_SECRET` (any long random string), `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `DATABASE_URL` = `file:./dev.db` (Prisma requires the variable, but it is not used when Turso is set).
3. Deploy. `netlify.toml` runs `npm run build:netlify`, which creates the tables and seeds the 15 events on the first deploy only.

## Logins

| Who | Where | Credentials |
| --- | --- | --- |
| Admin (hard-coded, set in `.env`) | http://localhost:3000/admin | `admin@events.local` / `Admin@123` |
| Visitor | http://localhost:3000/signup | create any account (password ≥ 8 chars) |

## Pages

- `/`: active, upcoming events, nearest first, with category + city + text search filters (combined with AND) and pagination
- `/events/:id`: event details, **Remind me**, **Design your card**
- `/signup`, `/login`, then `/preferences` (pick favourite categories), then `/feed` (**My Feed**)
- `/admin`: all events with Active/Inactive toggle · `/admin/events/new`: add event

## API

Every page uses these JSON endpoints. Auth works with either the httpOnly cookie (web) or `Authorization: Bearer <token>` (for a future mobile app). Errors are always `{ "error": "message" }` with a proper status code.

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | none | `{email, password}` → `{token, user}` |
| POST | `/api/auth/login` | none | `{email, password}` → `{token, user}` |
| POST | `/api/auth/logout` | none | clears the web cookie |
| GET | `/api/auth/me` | user | current user + favourite categories |
| GET | `/api/events?category=&city=&q=&page=` | none | active upcoming events, paginated |
| GET | `/api/events/:id` | none | one active event |
| GET | `/api/cities` | none | cities that have upcoming events (filter dropdown) |
| GET / PUT | `/api/me/favourites` | user | read / replace favourite categories `{categories: [...]}` |
| GET | `/api/me/feed?page=` | user | upcoming events in favourite categories |
| GET | `/api/me/reminders` | user | `{eventIds}` with reminders on |
| PUT / DELETE | `/api/me/reminders/:eventId` | user | turn a reminder on / off (idempotent) |
| GET / PUT | `/api/me/card-designs/:eventId` | user | read / save `{theme, stickers}` |
| POST | `/api/admin/login` | none | admin `{email, password}` → `{token}` |
| POST | `/api/admin/logout` | none | clears the admin cookie |
| GET / POST | `/api/admin/events` | admin | list all events / create event |
| PATCH | `/api/admin/events/:id` | admin | `{isActive}`: activate or deactivate (no delete) |

## What's left / known limits

- Reminders are only saved; nothing sends an email or notification. The brief didn't ask for it.
- Admin can add and activate/deactivate events but not edit them (not in the brief).
- No rate limiting on login, and JWTs can't be revoked before they expire (7 days). I'd add both before production.
- Times are entered and shown in IST (Asia/Kolkata).
- SQLite is fine for this size. For production I'd switch the Prisma provider to Postgres (one line) and use full-text search.

## Short answers

**1. Database structure and why**

```
Event(id, title, category, city, startsAt, price, description, imageUrl, isActive)
User(id, email UNIQUE, passwordHash)
FavouriteCategory(userId, category)              PK(userId, category)
Reminder(userId, eventId)                        PK(userId, eventId)
CardDesign(userId, eventId, theme, stickers)     PK(userId, eventId)
```
Each user-to-event link is a small table with a composite primary key, so "one reminder / one card per user per event" is enforced by the database and saving is a simple upsert.
Events are never deleted, only flagged with `isActive`.
Price is whole rupees in an `Int` (no float errors), and `startsAt` is stored in UTC and shown in IST.

**2. How the filter query works and which index**

Every query starts with `isActive = true AND startsAt >= now`, then adds `category = ?`, `city = ?` and `title/description LIKE %q%` only when given, all joined with AND.
Results are sorted by `startsAt` and paginated with `skip/take`, with a `count` for the total pages.
I added the indexes `(isActive, startsAt)` and `(isActive, category, city, startsAt)`, so both filtered and unfiltered lists come back already sorted.
`LIKE '%q%'` can't use a normal index, so with more data I'd add full-text search (Postgres `tsvector` + GIN).

**3. Passwords and admin protection**

Passwords are hashed with bcrypt (salted, cost 12), never stored in plain text, and a wrong email or password gives the same error.
Login returns a signed JWT with a `role`, which is also set as an `httpOnly` cookie so page scripts can't read it.
Admin is checked on the server three times: in middleware for `/admin` and `/api/admin`, in the admin layout, and inside every admin API.
A normal user's token is rejected because its role is not `admin`.
