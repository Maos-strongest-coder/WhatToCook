# WhatToCook — Database design

Source of truth for the schema in `server/prisma/schema.prisma`. Tables, fields,
data types, relations and the rules that are not obvious from the schema alone.

## Tables

### users
| field | type | notes |
|-------|------|-------|
| id | Int | PK, autoincrement |
| username | String | unique |
| email | String | unique |
| passwordHash | String | bcrypt |
| createdAt | DateTime | default now |

### categories (seeded, fixed, read-only)
| field | type | notes |
|-------|------|-------|
| id | Int | PK, autoincrement |
| name | String | unique |

Seeded values: `vegetables`, `fruit`, `dairy`, `meat`, `fish`, `grains`,
`spices`, `drinks`, `other`. Users cannot create categories.

### ingredients (per user)
| field | type | notes |
|-------|------|-------|
| id | Int | PK, autoincrement |
| userId | Int | FK -> users.id |
| name | String | |
| categoryId | Int | FK -> categories.id |
| createdAt | DateTime | default now |

### pantry_items (per user)
| field | type | notes |
|-------|------|-------|
| id | Int | PK, autoincrement |
| userId | Int | FK -> users.id |
| ingredientId | Int | FK -> ingredients.id |
| quantity | Float | |
| unit | Unit | enum |
| expiryDate | DateTime? | optional |
| createdAt | DateTime | default now |

### recipes (shared catalog)
| field | type | notes |
|-------|------|-------|
| id | Int | PK, autoincrement |
| title | String | |
| instructions | String | required (text) |
| sourceUrl | String? | optional link |
| createdAt | DateTime | default now |

### meals (per user)
| field | type | notes |
|-------|------|-------|
| id | Int | PK, autoincrement |
| userId | Int | FK -> users.id |
| name | String | |
| recipeId | Int? | FK -> recipes.id, optional |
| createdAt | DateTime | default now |

### meal_ingredients (meal <-> ingredient link)
| field | type | notes |
|-------|------|-------|
| id | Int | PK, autoincrement |
| mealId | Int | FK -> meals.id |
| ingredientId | Int | FK -> ingredients.id |
| quantity | Float | |
| unit | Unit | enum |

### prepared_meals (log that feeds the top 5)
| field | type | notes |
|-------|------|-------|
| id | Int | PK, autoincrement |
| userId | Int | FK -> users.id |
| mealId | Int | FK -> meals.id |
| preparedAt | DateTime | default now |

## Enums

```
enum Unit {
  g
  kg
  ml
  l
  piece
}
```

## Relations and referential actions

- `ingredients.userId` -> `users.id`, **Cascade** (a user owns their ingredients).
- `pantry_items.userId` -> `users.id`, **Cascade**.
- `meals.userId` -> `users.id`, **Cascade**.
- `prepared_meals.userId` -> `users.id`, **Cascade**.
- `pantry_items.ingredientId` -> `ingredients.id`, **Restrict** (blocks delete).
- `meal_ingredients.ingredientId` -> `ingredients.id`, **Restrict** (blocks delete).
- `ingredients.categoryId` -> `categories.id`, **Restrict**.
- `meal_ingredients.mealId` -> `meals.id`, **Cascade**.
- `prepared_meals.mealId` -> `meals.id`, **Cascade**.
- `meals.recipeId` -> `recipes.id`, **Set Null** (optional recipe).

## Business rules

1. **Ingredient deletion is blocked** when the ingredient is referenced by a
   `pantry_items` or `meal_ingredients` row. The API returns a clear 409 error;
   the schema `Restrict` prevents a silent cascade.
2. **Marking a meal prepared**:
   - creates a `prepared_meals` log row;
   - for each `meal_ingredients` row, finds the matching `pantry_items` row for
     the same user + ingredient;
   - **blocks with a clear error** if the meal ingredient's `unit` differs from
     the pantry item's `unit`;
   - decrements the pantry quantity by the meal ingredient quantity, **floored at
     0**; at 0 the pantry item is removed.
3. **Top 5** is derived from `prepared_meals` grouped by `mealId`.
4. **Recipes** are a shared catalog: required `instructions` (text) plus an
   optional `sourceUrl`. No `userId`.
5. **Meals and ingredients are per user** (`userId`); a user only sees their own.

## Notes

- User deletion is not part of the current scope; the `Restrict` rules on
  ingredient usage mean a user with referenced ingredients cannot be deleted
  without first removing those references.
- `quantity` is stored as `Float`; no currency/monetary values are involved.
