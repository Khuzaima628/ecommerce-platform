# Dev Setup — What We Installed and Why

A learning reference for this project. Every tool we added, what problem it
solves, and the command to use it.

---

## 1. Commands you will use every day

```bash
npm run dev        # START HERE — typechecker + server together
npm run typecheck  # check types once, without running
npm run lint       # check code style
npm run build      # compile TypeScript to dist/
npm start          # run the compiled app (production)
```

### All dev commands

| Command | What runs | Use when |
|---|---|---|
| `npm run dev` | `concurrently` → typechecker **+** nodemon | normal work |
| `npm run dev:server` | nodemon only | you want less terminal noise |
| `npm run dev:types` | `tsc --noEmit --watch` only | checking types, no server |
| `npm run dev:tsnd` | ts-node-dev | when restarts feel slow |

Stop any of them with **Ctrl + C**.

> **Why `dev` runs two things:** the server runs with `-T` (transpile only),
> which is fast but **skips type checking**. So a second process, `tsc --watch`,
> checks types and prints errors. Fast restarts *and* real error reporting.

Output is labelled so you know which process is talking:

```text
[TYPES]  src/services/authService.ts:1:13 - error TS2448: ...
[SERVER] DATABASE  MongoDB connected
[SERVER] SERVER  running on http://localhost:5000
```

---

## 2. `nodemon.json` — auto restart on save

```json
{
  "watch": ["src"],
  "ext": "ts,json",
  "ignore": ["src/**/*.test.ts", "src/**/*.spec.ts", "dist"],
  "exec": "ts-node -T -r tsconfig-paths/register src/server.ts",
  "delay": 500,
  "env": { "NODE_ENV": "development" }
}
```

| Key | Meaning |
|---|---|
| `watch` | only watch `src/` — ignores `node_modules` |
| `ext` | restart on `.ts` and `.json` saves |
| `exec` | the command nodemon runs |
| `-T` | transpile only — **no type check** (this is why we run `tsc` separately) |
| `-r tsconfig-paths/register` | makes `@src/...` imports work at runtime |
| `delay` | wait 500ms so saving many files = one restart |
| `env` | sets `NODE_ENV=development`, which our error handler checks to show stack traces |

Type `rs` + Enter in the terminal to restart manually.

---

## 3. Why a restart takes a few seconds

Measured on this machine:

| Phase | Time |
|---|---|
| ts-node re-compiles all files | ~3.2s |
| MongoDB Atlas connect (remote) | ~2.4s |
| nodemon delay | 0.5s |
| **Total** | **~6s** |

The database is on Atlas (internet), not local — that is a real network wait
and cannot be removed without running MongoDB locally.

---

## 4. Dependencies — what each one does

### Runtime (`dependencies`) — needed when the app runs

| Package | Purpose |
|---|---|
| `express` | the web server framework |
| `mongoose` | talks to MongoDB, defines schemas/models |
| `dotenv` | loads `.env` into `process.env` |
| `morgan` | logs every HTTP request in the terminal |
| `@colors/colors` | adds `.green` / `.bgGreen` to strings for colored logs |
| `helmet` | sets safe HTTP headers, hides `X-Powered-By` |
| `cors` | lets your frontend call this API from another origin |
| `express-rate-limit` | blocks an IP after too many requests |
| `express-mongo-sanitize` | removes `$` and `.` keys → stops NoSQL injection |
| `hpp` | stops duplicate query params breaking your code |
| `bcryptjs` | hashes passwords |
| `jsonwebtoken` | creates and verifies login tokens |
| `joi` | validates request data |

### Dev only (`devDependencies`) — only needed while coding

| Package | Purpose |
|---|---|
| `typescript` | the TypeScript compiler (`tsc`) |
| `ts-node` | runs `.ts` files directly, no build step |
| `nodemon` | watches files, restarts the server |
| `ts-node-dev` | alternative to nodemon with faster restarts |
| `concurrently` | runs two commands side by side |
| `tsconfig-paths` | resolves `@src/*` aliases at runtime |
| `tsc-alias` | rewrites `@src/*` aliases in the built `dist/` output |
| `@types/*` | type definitions for JS libraries |

> **Rule:** if the code `import`s it at runtime → `dependencies`.
> If it only helps you build or watch → `devDependencies` (`-D`).

```bash
npm install <pkg>       # runtime
npm install -D <pkg>    # dev only
```

---

## 5. Colors in the terminal

Two separate systems. They are not the same thing.

### A. Colors your app prints (`@colors/colors`)

Import once in `src/server.ts`, then any string gets color properties:

```ts
import "@colors/colors";

console.log(" SERVER ".bgGreen.black.bold, "running on http://localhost:5000".green);
console.log(" DATABASE ".bgCyan.black.bold, "MongoDB connected".cyan);
console.log(" STARTUP FAILED ".bgRed.white.bold, "error message".red);
```

Chain them: `.bgGreen` + `.black` + `.bold`.

| Type | Options |
|---|---|
| Text | `.red` `.green` `.yellow` `.blue` `.magenta` `.cyan` `.white` `.gray` |
| Background | `.bgRed` `.bgGreen` `.bgYellow` `.bgBlue` `.bgMagenta` `.bgCyan` |
| Style | `.bold` `.dim` `.italic` `.underline` |

### B. Colors of the editor / chat panel

Set in `.vscode/settings.json` under `workbench.colorCustomizations`
(`terminal.ansiGreen`, etc.). This changes *which actual color* green means.

`.vscode/` is gitignored — these stay on your machine only.

---

## 6. Request flow in `src/app.ts`

Order matters. Middleware runs top to bottom.

```ts
app.use(morgan("dev"));   // 1. log the request
applySecurity(app);       // 2. security + body parsing
Routes(app);              // 3. your API routes
app.all("*", ...)         // 4. no route matched → 404 AppError
app.use(globalErrorHandler); // 5. ALWAYS LAST — catches every error
```

`applySecurity` (in `src/config/security.ts`) runs, in order:

1. `cors` — must be first so preflight requests are answered
2. `helmet` — security headers
3. `express.json({ limit: "10kb" })` — parse body, block huge payloads
4. `express-mongo-sanitize` — after parsing, so there is a body to clean
5. `hpp` — collapse duplicate query params
6. `express-rate-limit` on `/api` — limit requests per IP

> The error handler **must** be last and **must** take 4 arguments
> `(err, req, res, next)`. Express uses the argument count to recognise it.

---

## 7. Environment variables

`.env` holds real secrets and is **gitignored** — never commit it.
`.env.example` is committed and shows the shape only, with empty values.

```bash
PORT=5000
MONGO_URI=mongodb://...
CORS_ORIGIN=http://localhost:3000
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
```

Read them with `process.env.PORT` — but only after `import "dotenv/config"`
runs, which is the first line of `src/server.ts`.

---

## 8. Path aliases (`@src/...`)

Instead of `../../utils/appError`, write:

```ts
import AppError from "@src/utils/appError";
```

Three pieces make this work:

| Where | What |
|---|---|
| `tsconfig.json` → `paths` | tells the **compiler** |
| `tsconfig-paths/register` | tells **ts-node** at dev runtime |
| `tsc-alias` in `npm run build` | rewrites them in `dist/` for production |

Miss any one and you get `Cannot find module '@src/...'`.

---

## 9. Quick troubleshooting

| Message | Cause | Fix |
|---|---|---|
| `EADDRINUSE :::5000` | a server is already running | close the other terminal, or change `PORT` |
| `Cannot find module '@src/...'` | alias not registered | check the three pieces in section 8 |
| `MONGO_URI is missing in .env` | no `.env` file | copy `.env.example` → `.env` and fill it |
| Editor shows an error, terminal does not | server runs with `-T` | run `npm run dev` (has the typechecker) |
| `MongooseServerSelectionError` | Atlas IP allowlist | Atlas → Network Access → add your IP |
