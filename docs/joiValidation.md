# Joi Validation — How It Works

## Core Concepts

Joi validates data **sequentially** — each rule runs in order, and if multiple rules fail, multiple errors can fire at once. Understanding this prevents duplicate or confusing error messages.

---

## Field Presence vs Field Value

These are two completely separate concerns in Joi:

| Method | What it controls |
|--------|-----------------|
| `.required()` | Field **must be present** in the request |
| `.optional()` | Field **can be absent** (undefined) — but if present, all other rules still apply |
| `.forbidden()` | Field **must not be present** |

> ⚠️ `.optional()` does **not** mean the field can be an empty string. It only means the field can be missing entirely.

```ts
// This field can be absent, but if sent it must be a valid non-empty string
joi.string().optional()

// Sending "" will still fail with "string.empty"
```

---

## How `joi.string()` Handles Empty Strings

By default, `joi.string()` **rejects empty strings** `""`. This is built-in behavior — you do not need to add `.invalid('')` to handle it.

```ts
joi.string()          // rejects: undefined (if required), ""
joi.string().trim()   // trims whitespace first, then rejects ""
```

### The `string.empty` error key
This fires when the value is `""`. Always add this message key for string fields:

```ts
joi.string().optional().messages({
  "string.empty": "Field cannot be empty",
})
```

---

## Why `.invalid('')` is Redundant (and Harmful)

```ts
// ❌ Bad — causes duplicate errors
joi.string().invalid('').optional()
```

When `""` is sent:
1. `.invalid('')` fires → `"any.invalid"` error
2. `joi.string()` fires → `"string.empty"` error

**Result:** Two error messages for the same problem.

```ts
// ✅ Good — joi.string() already handles empty strings
joi.string().optional()
```

---

## Why `.valid()` Can Cause Duplicates

`.valid()` checks if the value is one of the allowed values. When combined with `joi.string()`, sending `""` triggers both:

```ts
// ❌ Bad
joi.string().valid('a', 'b', 'c').optional()
// Sending "" fires: "string.empty" + "any.only" = 2 errors
```

**Fix** — add `.trim()` and a `"string.empty"` message so empty strings are caught before the `.valid()` check:

```ts
// ✅ Good
joi.string().trim().valid('a', 'b', 'c').optional().messages({
  "string.empty": "Field cannot be empty",
  "any.only": "Must be one of: a, b, c",
})
```

---

## The Role of `.trim()`

`.trim()` strips leading/trailing whitespace **before** any other validation runs. This means:

- `"  "` (spaces only) becomes `""` → caught by `"string.empty"`
- `"  hello  "` becomes `"hello"` → passes string checks

Always use `.trim()` on string fields to avoid whitespace-only values slipping through.

---

## Error Message Keys Reference

| Key | When it fires |
|-----|--------------|
| `"any.required"` | Field is missing and was `.required()` |
| `"any.invalid"` | Value matches something in `.invalid(...)` |
| `"any.only"` | Value is not in `.valid(...)` list |
| `"string.empty"` | Value is `""` |
| `"string.min"` | Value length is below `.min()` |
| `"string.max"` | Value length exceeds `.max()` |
| `"number.base"` | Value is not a number |
| `"number.min"` | Number is below `.min()` |
| `"number.max"` | Number exceeds `.max()` |
| `"array.base"` | Value is not an array |
| `"array.min"` | Array has fewer items than `.min()` |
| `"array.max"` | Array has more items than `.max()` |
| `"object.min"` | Object has fewer keys than `.min()` |

---

## Create vs Update Validation Pattern

A common pattern is to have two schemas — one for create (all required) and one for update (all optional):

```ts
// Create — everything required
export const productValidation = joi.object({
  productName: joi.string().trim().min(3).max(100).required().messages({
    "any.required": "Product name is required",
    "string.empty": "Product name cannot be empty",
    "string.min": "Minimum 3 characters",
  }),
});

// Update — everything optional, but if sent must be valid
export const productUpdateValidation = joi.object({
  productName: joi.string().trim().min(3).max(100).optional().messages({
    "string.empty": "Product name cannot be empty",
    "string.min": "Minimum 3 characters",
  }),
}).min(1).messages({
  "object.min": "Send at least one field to update",
});
```

> `.min(1)` on the object ensures the request body is not completely empty.

---

## Golden Rules

1. **Never use `.invalid('')` with `joi.string()`** — it's already handled
2. **Always add `"string.empty"` message** on optional string fields
3. **Always use `.trim()`** to handle whitespace-only inputs
4. **When using `.valid()`**, add both `"string.empty"` and `"any.only"` messages
5. **`.optional()` ≠ allow empty string** — it only means the field can be absent
