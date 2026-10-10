# Community Events Board

An admin posts local events (music nights, workshops, food fairs…) and visitors browse them, pick favourite categories, set reminders and design a personal card for each event.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Prisma + SQLite · JWT (`jose`) · `bcryptjs` · `zod` · `motion` (animations) · `sonner` (toasts)

## Setup (about 2 minutes)

Needs **Node.js 18.18+** (tested on Node 24). No database server is needed because SQLite is a file.

```bash
git clone <repo-url> community-events-board
cd community-events-board
npm install                 # also runs `prisma generate`
cp .env.example .env        # Windows (cmd): copy .env.example .env
npm run setup               # creates prisma/dev.db and seeds 15 sample events
npm run dev                 # http://localhost:3000
```

Run `npm run db:seed` any time to reset the events. Seed dates are relative to today, so there are always upcoming and past events.

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
Event(id, title, category, city, startsAt, price, description, imageUrl, isActive, createdAt, updatedAt)
User(id, email UNIQUE, passwordHash, createdAt)
FavouriteCategory(userId, category)        PK(userId, category)
Reminder(userId, eventId, createdAt)       PK(userId, eventId)
CardDesign(userId, eventId, theme, stickers JSON, updatedAt)  PK(userId, eventId)
```
Each user-to-event relationship is its own small table with a composite primary key. That makes "one reminder / one card per user per event" a database rule, and toggling becomes a simple idempotent upsert or delete. `isActive` is a flag so events are never deleted. Price is stored as whole rupees in an `Int` (no float rounding), and `startsAt` is UTC, formatted to IST only for display.

**2. How the filter query works and which index**

`GET /api/events` always starts with `isActive = true AND startsAt >= now()`, then adds `category = ?`, `city = ?` and `(title LIKE %q% OR description LIKE %q%)` only when each one is given. All parts are ANDed, sorted by `startsAt ASC`, and paginated with `count` + `skip/take` in one transaction. Indexes: `(isActive, startsAt)` covers the default list and its sort, and `(isActive, category, city, startsAt)` covers filtered lists without a separate sort. `LIKE '%q%'` can't use a B-tree index, so at scale I'd use Postgres full-text search (a `tsvector` column with a GIN index) or a trigram index.

**3. Passwords and admin protection**

Passwords are hashed with bcrypt (cost 12, salted) and never stored or returned in plain text. Login gives the same error for a wrong email and a wrong password. After login the server signs a JWT (HS256, 7-day expiry) with a `role` claim. It is returned in the JSON and also set as an `httpOnly`, `SameSite=Lax` cookie, so page JavaScript can't read it. Admin protection has three server-side layers: the middleware verifies the admin JWT for `/admin/*` and `/api/admin/*`, the admin layout re-checks it before rendering, and every admin API handler calls `requireAdmin()` itself. A user token is rejected because its role is not `admin`.
