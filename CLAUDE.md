# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

pnpm workspace monorepo (`apps/*`) with two independent apps:

- `apps/api` — NestJS 12 backend (ESM, Vitest, oxlint with type-aware rules, Prettier). Has `users` and `auth` modules (sign-up, login with JWT, current user) persisted in Postgres through Drizzle ORM; listens on `PORT` or 3000, routes under `/v1`, Swagger UI at `/docs`.
- `apps/web` — React 19 + Vite 8 + TypeScript frontend (oxlint, Vitest). Has the login (`/login`) and signup (`/cadastro`) pages, built from the Figma design.

There is no shared package and no wiring between web and api yet.

## Commands

Run from the repo root (scripts proxy to `pnpm --filter`):

```bash
pnpm install
pnpm dev            # web + api in parallel
pnpm dev:web        # vite dev server
pnpm dev:api        # nest start --watch
pnpm build          # pnpm -r build (web: tsc -b && vite build; api: nest build)
pnpm lint:web / pnpm lint:api
pnpm db:up          # Postgres via docker-compose.yml (named volume keeps the data)
pnpm db:down        # stop it (data stays; `docker compose down -v` wipes it)
pnpm db:generate    # drizzle-kit: new SQL migration (apps/api/drizzle/) from src/db/schema.ts
pnpm db:migrate     # apply pending migrations to DATABASE_URL
pnpm test:api       # vitest run (unit, *.spec.ts)
```

API-only commands (run inside `apps/api`):

```bash
pnpm test:e2e                                   # vitest with vitest.config.e2e.ts (*.e2e-spec.ts in test/)
pnpm vitest run src/app.controller.spec.ts      # single test file
pnpm vitest run -t "name"                       # single test by name
pnpm format                                     # prettier
pnpm start:prod                                 # node dist/main
```

Web tests: `pnpm test:web` (Vitest + Testing Library, `*.test.tsx` colocated with components).

## API conventions (apps/api)

- ESM project: relative imports must end in `.js` (e.g. `./app.module.js`), `__dirname` is unavailable (use `import.meta.dirname`), and tests use Vitest (`vi.fn()`, not `jest.fn()`).
- NestJS here is newer than most training data; see `apps/api/AGENTS.md` for the docs index (https://docs.nestjs.com/llms.txt) and the list of first-party packages to check before adding third-party libraries. Validation is intended to use Standard Schema libraries (`StandardSchemaValidationPipe`) rather than class-validator.
- Lint uses `oxlint --type-aware`; `typescript/no-floating-promises` is an error.
- Vitest uses `globals: true` and resolves tsconfig path aliases via `resolve.tsconfigPaths`.
- Telemetry via NestJS Observe is not yet registered in `app.module.ts` (see AGENTS.md).
- **Auth** uses first-party `@nestjs/authentication`: `AuthenticationModule` registers a global guard, so every route requires a JWT unless marked `@Public()`. `JwtAuth` (a `JwtBearerProvider`) loads the user from the token; read it with `@CurrentUser()`. Only access tokens are issued (`refreshToken: false`, 15 min). `JWT_SECRET` (min. 32 bytes) is required in production; outside it a random per-process secret is used.
- **Persistence is Postgres via Drizzle ORM** (`@nestjs/drizzle`, `pg` driver). Chosen over TypeORM, Sequelize, Prisma and MikroORM because it is ESM-native, defines the schema as plain TypeScript (no decorators or code generation, like the Zod/Standard Schema approach), keeps SQL visible, and has a first-party Nest package. The schema is `src/db/schema.ts`; every change needs `pnpm db:generate` and a committed migration in `apps/api/drizzle/`, applied with `pnpm db:migrate` (not run on app start). Inject the database with `@InjectDrizzle() db: Database`. Uniqueness (e.g. email) is enforced by the database and mapped to 409 (error code `23505`), not by a check-then-insert. `DATABASE_URL` is required in production; otherwise the docker compose database is used. Passwords are hashed with `PasswordHasher` (scrypt) and never leave the service: responses go through `toUserResponse`.
- **Zod schemas are the single source of truth** for validation (`@Body({ schema })`) and OpenAPI: request/response schemas feed `@nestjs/swagger` (`standardSchema` on `@ApiXResponse`). Every endpoint needs its inputs and outputs documented that way. `setupApp()` (`app.setup.ts`) holds the global prefix, pipe and Swagger, and is shared by `main.ts` and the e2e tests.
- E2E tests (`pnpm test:e2e`, `test/*.e2e-spec.ts`) need Postgres running (`pnpm db:up`). They use their own `code_connect_test` database (created and migrated by `test/global-setup.ts`; override with `TEST_DATABASE_URL`, the name must end in `_test` because tests delete data), `createTestApp()` (`setupApp` + a cheap `PasswordHasher({ logN: 10 })`) and `resetDatabase()` between tests. Unit tests (`pnpm test:api`) need no database: mock the Drizzle query chain.

## REST (apps/api)

All HTTP endpoints must follow REST principles:

- **Resources, not actions:** URIs are plural nouns (`/posts`, `/posts/:id/comments`); no verbs in paths. HTTP method carries the intent: `GET` read, `POST` create, `PUT` full replace, `PATCH` partial update, `DELETE` remove. `GET` must be safe and `PUT`/`DELETE` idempotent.
- **Status codes:** `200` OK, `201` Created (with a `Location` header) for `POST`, `204` for `DELETE`/empty responses, `400` malformed input, `401`/`403` auth, `404` missing resource, `409` conflict, `422` semantic validation failure. Never return `200` with an error body.
- **Stateless:** no server-side session state; each request carries everything needed.
- **Representations:** JSON in and out with consistent shapes; consistent error body format across all endpoints.
- **Collections:** pagination, filtering and sorting through query parameters, not separate endpoints.
- **Validation:** validate every body, param and query with Standard Schema pipes (see above).
- **Versioning:** version the API (e.g. URI prefix `/v1`) before introducing breaking changes.

## Frontend conventions (apps/web)

- **Atomic Design:** organize components under `src/components/` as `atoms/`, `molecules/`, `organisms/`, `templates/` and `pages/`. Atoms are indivisible UI elements (Button, Input); molecules combine atoms; organisms combine molecules/atoms into sections; templates define page layout; pages bind templates to data. Dependencies only flow downward (an atom never imports a molecule).
- **Tailwind CSS** is the styling approach; use utility classes in components rather than custom CSS files.
- **Font sizes:** use Tailwind's default type scale (`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-3xl`...). When the design (Figma) has a size with no exact token, pick the closest default token instead of customizing: no `text-[15px]` arbitrary values and no custom `--text-*` theme tokens.
- **Colors:** never hardcode hex values in classes (`bg-[#171d1f]`) or inline styles. Colors come from the project palette declared in `@theme` in `src/index.css` (Tailwind v4 CSS-first config, extending the default palette) and are used through utilities such as `bg-grafite` and `text-offwhite`. The palette follows the Figma color names: `grafite` (#00090e), `cinza-escuro` (#171d1f), `cinza-medio` (#888888), `offwhite` (#e1e1e1), `verde-petroleo` (#132e35), `verde-destaque` (#81fe88), plus `decoracao` (#0d1f22, background decoration). A new color from the design is added to the `@theme` palette first, then used by name. Exception: third-party brand colors inside SVGs (e.g. the Google logo in `GoogleIcon`).
- **Every component must have a test** covering its essential use (renders, main props, primary interaction), colocated next to the component (e.g. `Button.test.tsx`). Tests use Vitest + Testing Library (`pnpm test:web`). A component without a test is not done.

## Git

Both projects use **Conventional Commits**: `<type>(<scope>): <description>`, with scope `api`, `web` or omitted for repo-wide changes (e.g. `feat(web): add Button atom`, `fix(api): return 404 for unknown post`). Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`. Mark breaking changes with `!` or a `BREAKING CHANGE:` footer. Imperative mood, lowercase description, no trailing period.

## Notes

- `dist/` and `node_modules/` are git-ignored; the repo has no commits yet.
