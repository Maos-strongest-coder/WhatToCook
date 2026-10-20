# AGENTS.md

## Project

WhatToCook — a meal-suggestion system built to reduce food waste. It tracks the
user's pantry/fridge inventory (with expiry dates), suggests meals based on what
is on hand, and maps eating habits to support a healthier lifestyle.

## Stack

- Frontend: Vue 3 (TypeScript)
- Backend: Node.js + Express (TypeScript)
- Database: PostgreSQL via Prisma ORM
- Auth: username + password; `username` must be unique; passwords hashed with
  bcrypt; JWT returned and sent as `Authorization: Bearer <token>`. A failed
  login returns a generic error ("Invalid username or password") and must not
  reveal whether the username or the password was wrong.

Two separate projects, each with its own `package.json`:
- `client/` — Vue 3 app
- `server/` — Express API

There is no `package.json` at the repo root.

## Architecture / domain

- Core entities: `User`, `Category` (seeded fixed list), `Ingredient` (per user),
  `PantryItem` (per user; has quantity, unit and expiry), `Recipe` (shared
  catalog; required `instructions` + optional `source_url`), `Meal` (per user),
  `MealIngredient` (meal<->ingredient link with quantity + unit), `PreparedMeal`
  (log that feeds the top 5).
- Key flows: inventory tracking -> recipe matching -> meal suggestions ->
  habit insights.
- `ingredients` and `meals` are per user (`userId`); `recipes` are a shared
  catalog (no `userId`).
- Units are a Prisma enum (`g`, `kg`, `ml`, `l`, `piece`). Categories are a
  seeded fixed list (vegetables, fruit, dairy, meat, fish, grains, spices,
  drinks, other); users cannot create them.
- Marking a meal prepared decrements the matching pantry quantities, floored at
  0 (the item is removed at 0), and is blocked with a clear error on a unit
  mismatch.
- Deleting an ingredient used in a meal or pantry item is blocked with a clear
  error, never cascade-deleted.
- The Express API owns all database access; the Vue client must never talk to
  Postgres directly.
- Client and server are built and tested independently.
- Prisma schema: `server/prisma/schema.prisma`; generated client output is
  `server/generated/prisma` (wired via `server/prisma.config.ts`). `DATABASE_URL`
  lives in `server/.env`. Prisma is pinned to 6.19.3 (`prisma` and
  `@prisma/client` must stay on the same version).

## Commands

Run each command from inside the relevant project directory (`client/` or
`server/`). Never invent scripts; these are taken from the actual
`package.json` files.

### client/ (Vue 3)

- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build` (runs `type-check` then `build-only`)
- Type-check: `npm run type-check`
- Lint (oxlint + eslint, auto-fix): `npm run lint`
- Unit tests (Vitest): `npm run test:unit` (there is no plain `test` script)

### server/ (Express)

- Install: `npm install`
- Dev (watch mode): `npm run dev`
- Build: `npm run build` (`tsc` -> `dist/`)
- Start (built output): `npm run start`

## Conventions

- TypeScript strict mode everywhere.
- UI text and user stories in Dutch (e.g. the "Inloggen" button); code, comments
  and commit messages in English.
- Never commit `.env` / secrets; load config via env variables.
- Keep API routes under a versioned prefix (e.g. `/api/...`).
- Work is tracked in `tasks.md`; commit and push after each phase is completed.
