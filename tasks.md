# WhatToCook — Tasks

Dynamic TODO list. `- [ ]` = open, `- [x]` = done. Update as work progresses.
Each task references its user story ([US-n]) and ends with a "Done when:" line.

Design decisions locked in (see the answer set):
- Recipes: required `instructions` (text) + optional `source_url`.
- Pantry tracks `quantity` + `unit`; marking a meal prepared decrements quantities,
  never below 0; at 0 the pantry item is removed.
- Password reset: log the reset link to the console in dev behind one swappable
  `sendResetEmail` function.
- Units: Prisma enum `g`, `kg`, `ml`, `l`, `piece`. A unit mismatch between a meal
  ingredient and the pantry item blocks the "prepared" action with a clear error.
- Categories: seeded fixed list (vegetables, fruit, dairy, meat, fish, grains,
  spices, drinks, other); users cannot create categories.
- Meals and ingredients are per user (`userId`); deleting an ingredient used in a
  meal or pantry item is blocked with a clear error, never cascade-deleted.

---

## Phase 0 — Scaffolding (done)

- [x] Create `AGENTS.md` (project, stack, domain, commands, conventions)
- [x] Scaffold `client/` — Vue 3 + TS + Router + Pinia + Vitest + ESLint
- [x] Scaffold `server/` — Express + TS + Prisma, `GET /api/health` route
  Done when: all scripts run; health route returns `{"status":"ok"}`.

---

## Phase 1 — Database

- [ ] 1.1 Get PostgreSQL running and create the `whattocook` database [US-1]
  Done when: a connection succeeds and the database exists.
- [ ] 1.2 Write the database design (tables, fields, data types, relations) [US-1]
  Done when: design covers `users`, `categories`, `ingredients`, `pantry_items`,
  `recipes`, `meals`, `meal_ingredients`, `prepared_meals` with fields, types and
  relations, and states:
  - `ingredients` and `meals` each carry a `userId` (per user).
  - `categories` is the seeded fixed list (9 entries); no create path.
  - `recipes` have required `instructions` (text) and optional `source_url`.
  - `meal_ingredients` and `pantry_items` carry `quantity` + `unit` (enum).
  - deleting an ingredient referenced by a meal or pantry item is blocked.
  - marking a meal prepared decrements pantry quantities, floored at 0 (item
    removed at 0), and is blocked on a unit mismatch.
- [ ] 1.3 Implement the Prisma schema models [US-1]
  Done when: `server/prisma/schema.prisma` contains all models, a `Unit` enum
  (`g`, `kg`, `ml`, `l`, `piece`), `userId` on `ingredients` and `meals`, the
  `Category` model, `recipes.instructions` (required) + `source_url` (optional),
  and relations that block ingredient deletion (`onDelete: Restrict`).
- [ ] 1.4 Create and apply the first migration [US-1]
  Done when: `prisma migrate dev` succeeds and the tables exist in Postgres.
- [ ] 1.5 Seed the fixed category list [US-4]
  Done when: the 9 categories exist in the database and there is no endpoint that
  creates categories.

---

## Phase 2 — Auth

- [ ] 2.1 Set up server test infrastructure (Vitest + supertest) [US-13]
  Done when: a test can boot the Express app and assert on a response.
- [ ] 2.2 Registration endpoint `POST /api/auth/register` [US-15]
  Done when: creates a user with a bcrypt-hashed password, enforces a unique
  `username`, returns 201.
- [ ] 2.3 Login endpoint `POST /api/auth/login` [US-13]
  Done when: returns a JWT on valid credentials; returns the generic error
  "Invalid username or password" on failure.
- [ ] 2.4 JWT auth middleware [US-13]
  Done when: protected routes reject a missing/invalid Bearer token with 401.
- [ ] 2.5 Auth store (Pinia) [US-13]
  Done when: store holds the current user/token and exposes login/register/logout.
- [ ] 2.6 Registration page with a "Registreren" button [US-15]
  Done when: form has username/email/password; redirects to login on success.
- [ ] 2.7 Login page with an "Inloggen" button [US-13]
  Done when: form has username/password; stores the JWT and redirects on success.
- [ ] 2.8 Route guard [US-13]
  Done when: unauthenticated users are redirected to the login page.
- [ ] 2.9 Backend auth tests [US-13, US-15]
  Done when: register/login/middleware tests pass.
- [ ] 2.10 Frontend auth tests [US-13, US-15]
  Done when: Vitest tests cover the register/login pages and the route guard.

---

## Phase 3 — Ingredients

- [ ] 3.1 Create ingredient endpoint `POST /api/ingredients` [US-2]
  Done when: saves the ingredient for the authenticated user and returns 201.
- [ ] 3.2 Delete ingredient endpoint `DELETE /api/ingredients/:id` [US-3]
  Done when: removes an unused ingredient (204) and returns a clear 409 error
  when it is used in a meal or pantry item (no cascade delete).
- [ ] 3.3 List categories `GET /api/categories` [US-4]
  Done when: returns the fixed category list; there is no category-create endpoint.
- [ ] 3.4 Assign/update ingredient category `PATCH /api/ingredients/:id` [US-4]
  Done when: the category is updated and returned.
- [ ] 3.5 Ingredients store (Pinia) [US-2]
  Done when: store fetches the current user's ingredients and holds the fixed
  category list.
- [ ] 3.6 Add ingredient form [US-2]
  Done when: the form saves a new ingredient for the current user.
- [ ] 3.7 Delete ingredient UI [US-3]
  Done when: delete removes it from the list and shows the clear error when the
  deletion is blocked.
- [ ] 3.8 Category assignment + display [US-4]
  Done when: a fixed-list category can be chosen when adding/editing and is shown
  in the list.
- [ ] 3.9 Backend ingredient tests [US-2, US-3, US-4]
  Done when: tests cover per-user ingredients, blocked delete, and read-only
  categories.
- [ ] 3.10 Frontend ingredient tests [US-2, US-3, US-4]
  Done when: Vitest tests cover add/delete (including the blocked case)/category.

---

## Phase 4 — Pantry

- [ ] 4.1 Add to pantry `POST /api/pantry` [US-5]
  Done when: creates a pantry item with `quantity`, `unit` (enum) and expiry date.
- [ ] 4.2 View pantry `GET /api/pantry` [US-5]
  Done when: returns the current user's pantry items with quantity and unit.
- [ ] 4.3 Category filter `GET /api/ingredients?categoryId=` [US-6]
  Done when: returns only ingredients of the chosen category.
- [ ] 4.4 Remove from pantry `DELETE /api/pantry/:id` [US-7]
  Done when: removes the item and returns 204.
- [ ] 4.5 Pantry store (Pinia) [US-5]
  Done when: store fetches/adds/removes the current user's pantry items.
- [ ] 4.6 Add to pantry UI [US-5]
  Done when: the user can add an ingredient with a quantity and unit.
- [ ] 4.7 Pantry list view [US-5]
  Done when: shows pantry items with quantity, unit and expiry dates.
- [ ] 4.8 Category filter while adding [US-6]
  Done when: the filter limits selectable ingredients to the chosen category.
- [ ] 4.9 Remove from pantry UI [US-7]
  Done when: remove deletes the item from the view.
- [ ] 4.10 Backend pantry tests [US-5, US-6, US-7]
  Done when: add/view/filter/remove tests pass, including quantity and unit.
- [ ] 4.11 Frontend pantry tests [US-5, US-6, US-7]
  Done when: Vitest tests cover add (with quantity/unit)/view/filter/remove.

---

## Phase 5 — Meals

- [ ] 5.1 Compose meal `POST /api/meals` (with `meal_ingredients`) [US-8]
  Done when: saves the meal for the authenticated user and its ingredient links
  with `quantity` + `unit` (enum).
- [ ] 5.2 Attach recipe to meal `PATCH /api/meals/:id/recipe` [US-10]
  Done when: saves the required `instructions` text and optional `source_url`,
  and returns them with the meal.
- [ ] 5.3 Meal suggestions `GET /api/meals/suggestions` [US-9]
  Done when: returns the current user's meals whose ingredients are available in
  their pantry.
- [ ] 5.4 Meals store (Pinia) [US-8]
  Done when: store composes meals (with quantities/units), attaches recipes and
  fetches suggestions for the current user.
- [ ] 5.5 Compose meal UI [US-8]
  Done when: the user can build a meal from ingredients with quantity and unit.
- [ ] 5.6 Add recipe to meal UI [US-10]
  Done when: recipe instructions (required) and an optional source link can be
  attached and are visible.
- [ ] 5.7 Meal suggestions view [US-9]
  Done when: suggestions are listed in a clear format.
- [ ] 5.8 Backend meal tests [US-8, US-9, US-10]
  Done when: compose/attach/suggest tests pass, including per-user and
  quantity/unit handling.
- [ ] 5.9 Frontend meal tests [US-8, US-9, US-10]
  Done when: Vitest tests cover compose (with quantities/units)/attach/suggestions.

---

## Phase 6 — Insights

- [ ] 6.1 Mark meal prepared `POST /api/meals/:id/prepared` [US-11]
  Done when: logs a prepared meal; decrements the matching pantry quantities by
  the meal's ingredient quantities; never goes below 0 and removes the item at 0;
  returns a clear error when a unit mismatch exists.
- [ ] 6.2 Top 5 most prepared `GET /api/insights/top-meals` [US-12]
  Done when: returns the top 5 meals by prepared count.
- [ ] 6.3 Insights store (Pinia) [US-11]
  Done when: store marks meals prepared (surfacing unit-mismatch errors) and
  fetches the top 5.
- [ ] 6.4 Mark prepared UI [US-11]
  Done when: a button marks the meal prepared, the pantry updates, and
  unit-mismatch errors are shown.
- [ ] 6.5 Top 5 view [US-12]
  Done when: shows the top 5 most prepared meals.
- [ ] 6.6 Backend insight tests [US-11, US-12]
  Done when: prepared + top-5 tests pass, including decrement, removal at 0 and
  unit-mismatch blocking.
- [ ] 6.7 Frontend insight tests [US-11, US-12]
  Done when: Vitest tests cover prepared (including errors) + top 5.

---

## Phase 7 — Password reset

- [ ] 7.1 Request reset `POST /api/auth/forgot-password` [US-14]
  Done when: generates a reset token and calls `sendResetEmail`, which logs the
  reset link to the console in development (one swappable function).
- [ ] 7.2 Reset password `POST /api/auth/reset-password` [US-14]
  Done when: a valid token updates the password.
- [ ] 7.3 "Wachtwoord vergeten" UI [US-14]
  Done when: a link on the login page leads to a reset form.
- [ ] 7.4 Password reset tests [US-14]
  Done when: forgot/reset tests pass.
