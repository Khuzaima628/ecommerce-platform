# Markdown Cheatsheet

How the formatting in our docs works. Markdown is plain text — no plugin or
config file is needed. GitHub, VS Code preview, and most chat tools render it.

Preview any `.md` file in VS Code with **Ctrl + Shift + V**.

---

## 1. Emphasis (highlighting words)

| Write | Renders |
|---|---|
| `**important**` | **important** |
| `*subtle*` | *subtle* |
| `` `code` `` | `code` |
| `~~removed~~` | ~~removed~~ |

Use `**bold**` for a word the reader must not miss, and backticks for anything
you would type literally: `npm run dev`, `PORT`, `src/app.ts`, `AppError`.

> Rule of thumb: if it is a filename, a variable, a command, or a value, it goes
> in backticks. Bold is for emphasis, not for code.

---

## 2. Code blocks with syntax colors

Three backticks, then the **language name**. That tag is what enables coloring.

```ts
const app = express();
app.use(cors(corsOptions));
```

Same code with no tag after the backticks — notice it stays grey:

```
const app = express();
app.use(cors(corsOptions));
```

Tags used in this project:

| Tag | For |
|---|---|
| `ts` | TypeScript source |
| `js` | plain JavaScript |
| `json` | `package.json`, `nodemon.json`, API responses |
| `bash` | terminal commands |
| `text` | plain output, logs, trees |
| `diff` | before/after changes |

### Highlighting a change with `diff`

Lines starting with `-` turn red, `+` turn green:

```diff
- "dev": "ts-node-dev --respawn --transpile-only src/server.ts"
+ "dev": "nodemon"
```

---

## 3. Callouts

Use `>` to make a point stand out:

> **Note:** `nodemon.json` sets `NODE_ENV=development`, which our
> `errorHandler` checks before returning stack traces.

> **Warning:** never commit `.env` — it holds the Atlas password and JWT secrets.

---

## 4. Tables

Pipes and a dashed separator row. Columns do not need to line up in the source.

```text
| Script | Does |
|---|---|
| `npm run dev` | starts nodemon |
| `npm run build` | compiles to `dist/` |
```

Renders as:

| Script | Does |
|---|---|
| `npm run dev` | starts nodemon |
| `npm run build` | compiles to `dist/` |

---

## 5. Headings, lists, links

```md
# Page title       (one per file)
## Section
### Sub-section

- bullet
- bullet
  - nested (indent 2 spaces)

1. first
2. second

- [ ] todo item
- [x] done item

[link text](https://example.com)
[relative file link](../src/app.ts)
```

Relative links are clickable in VS Code and on GitHub — prefer them over bare
paths so readers can jump straight to the file.

---

## 6. Showing backticks inside a code block

Wrap the outer block in **four** backticks so the inner three survive:

````text
```ts
const x = 1;
```
````

---

## 7. Horizontal rule

Three dashes on their own line separates sections:

```md
---
```
