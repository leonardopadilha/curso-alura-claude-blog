# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

pnpm workspace monorepo (`apps/*`) with two independent apps:

- `apps/api` — NestJS 12 backend (ESM, Vitest, oxlint with type-aware rules, Prettier). Currently the default scaffold (`AppModule` / `AppController` / `AppService`); listens on `PORT` or 3000.
- `apps/web` — React 19 + Vite 8 + TypeScript frontend (oxlint). Currently the default Vite template.

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

The web app has no test runner configured.

## API conventions (apps/api)

- ESM project: relative imports must end in `.js` (e.g. `./app.module.js`), `__dirname` is unavailable (use `import.meta.dirname`), and tests use Vitest (`vi.fn()`, not `jest.fn()`).
- NestJS here is newer than most training data; see `apps/api/AGENTS.md` for the docs index (https://docs.nestjs.com/llms.txt) and the list of first-party packages to check before adding third-party libraries. Validation is intended to use Standard Schema libraries (`StandardSchemaValidationPipe`) rather than class-validator.
- Lint uses `oxlint --type-aware`; `typescript/no-floating-promises` is an error.
- Vitest uses `globals: true` and resolves tsconfig path aliases via `resolve.tsconfigPaths`.
- Telemetry via NestJS Observe is not yet registered in `app.module.ts` (see AGENTS.md).

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
- **Every component must have a test** covering its essential use (renders, main props, primary interaction), colocated next to the component (e.g. `Button.test.tsx`). The web app has no test runner yet, so add one (Vitest + Testing Library, matching the API's Vitest) and a `test` script together with the first component. A component without a test is not done.

## Git

Both projects use **Conventional Commits**: `<type>(<scope>): <description>`, with scope `api`, `web` or omitted for repo-wide changes (e.g. `feat(web): add Button atom`, `fix(api): return 404 for unknown post`). Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`. Mark breaking changes with `!` or a `BREAKING CHANGE:` footer. Imperative mood, lowercase description, no trailing period.

## Notes

- `dist/` and `node_modules/` are git-ignored; the repo has no commits yet.
