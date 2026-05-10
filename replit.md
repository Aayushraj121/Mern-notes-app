# NoteFlow

A multi-user Notes service where each user manages their own notes, with role-based access control and admin moderation.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/notes-app run dev` — run the frontend (port 25135)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY` — auto-provisioned by Clerk setup

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4 + shadcn/ui + Framer Motion + Wouter
- Auth: Clerk (Replit-managed, white-label)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/db/src/schema/notes.ts` — Drizzle notes table schema
- `artifacts/api-server/src/routes/notes.ts` — Notes + Admin route handlers
- `artifacts/api-server/src/middlewares/clerkProxyMiddleware.ts` — Clerk proxy middleware
- `artifacts/notes-app/src/` — React frontend

## Architecture decisions

- Contract-first: OpenAPI spec drives codegen for both Zod schemas (server) and React Query hooks (client)
- Clerk auth with proxy: Clerk traffic is proxied through `/api/__clerk` so the frontend and API share one domain
- Role-based access: Admin role stored in Clerk `sessionClaims.metadata.role`; owner-only updates enforced server-side
- Search uses SQL `ILIKE` for case-insensitive full-text search on title + content
- Pagination with `skip/limit` pattern, tags stored as `text[]` column in Postgres

## Product

- Users sign up, create/edit/delete their own notes with tags and pin support
- Search notes by keyword, filter by tag or pinned status, paginate results
- Dashboard stats: total notes, pinned count, top tags, recent activity
- Admins can view and delete any user's notes from an admin panel
- Beautiful landing page for signed-out visitors

## User preferences

- Attractive and user-friendly UI requested

## Gotchas

- Always re-run codegen after changing `lib/api-spec/openapi.yaml`
- Clerk development keys are test-only; production keys are automatically set on deploy
- Tags are stored as `text[]` — use `@> ARRAY[tag]::text[]` for PostgreSQL array containment queries

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
