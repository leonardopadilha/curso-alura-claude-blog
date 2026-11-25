# CodeConnect — API

Backend REST da plataforma CodeConnect. NestJS 12, ESM, Postgres via Drizzle ORM.

## Stack

- **NestJS 12** (ESM) — framework HTTP
- **Drizzle ORM** + **pg** — acesso ao Postgres (schema em TypeScript, sem decorators)
- **Zod** — validação de entrada e contrato OpenAPI (`StandardSchemaValidationPipe`)
- **@nestjs/authentication** + JWT — guard global; rotas públicas marcadas com `@Public()`
- **Vitest** — testes unitários e e2e
- **oxlint** (type-aware) — linter

## Estrutura

```
src/
├── auth/           # Login, JWT provider, guard global
├── users/          # Cadastro, resposta de usuário
├── posts/          # Feed, detalhes, curtidas, comentários, tags
├── uploads/        # Upload de thumbnails (PNG/JPEG/WebP, máx. 2 MB)
├── db/
│   ├── schema.ts   # Fonte única de verdade das tabelas (users, posts, post_likes, comments)
│   └── seed.ts     # Dados mockados para desenvolvimento
└── config/         # database, jwt, uploads
```

## Comandos

```bash
# a partir da raiz do monorepo
pnpm dev:api          # nest start --watch
pnpm build:api        # nest build
pnpm lint:api         # oxlint --type-aware
pnpm test:api         # vitest run (unit)
pnpm db:generate      # drizzle-kit generate (nova migration)
pnpm db:migrate       # aplica migrations pendentes
pnpm db:seed          # popula o banco com dados mockados

# direto em apps/api
pnpm test:e2e         # vitest com vitest.config.e2e.ts (requer banco)
pnpm format           # prettier
```

## Endpoints

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/v1/auth/login` | — | Login; retorna access token |
| `POST` | `/v1/users` | — | Cadastro |
| `GET` | `/v1/users/me` | JWT | Usuário autenticado |
| `GET` | `/v1/posts` | opcional | Feed com busca, tags e ordenação |
| `POST` | `/v1/posts` | JWT | Criar post |
| `GET` | `/v1/posts/:id` | opcional | Detalhes do post |
| `PUT` | `/v1/posts/:id/likes/me` | JWT | Curtir |
| `DELETE` | `/v1/posts/:id/likes/me` | JWT | Descurtir |
| `GET` | `/v1/posts/:id/comments` | opcional | Comentários do post |
| `POST` | `/v1/posts/:id/comments` | JWT | Comentar ou responder |
| `GET` | `/v1/tags` | — | Tags disponíveis |
| `POST` | `/uploads` | JWT | Upload de thumbnail |

Swagger disponível em `http://localhost:3000/docs`.

## Banco de dados

O schema (`src/db/schema.ts`) define quatro tabelas:

- **`users`** — id, name, email (único), password_hash, created_at
- **`posts`** — id, author_id, title, description, code, thumbnail_url, tags (`text[]`), search_vector (`tsvector` gerado), created_at
- **`post_likes`** — PK composta (post_id, user_id)
- **`comments`** — id, post_id, author_id, parent_id (auto-referência, 1 nível), content, created_at

A busca full text usa o dicionário `portuguese` via coluna `search_vector` gerada com GIN index. Tags são filtradas com o operador `@>`.

Toda mudança no schema precisa de `pnpm db:generate` seguido de commit da migration em `drizzle/`.

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `DATABASE_URL` | docker compose local | URL do Postgres |
| `JWT_SECRET` | aleatório por processo | Segredo JWT (mín. 32 bytes em produção) |
| `PORT` | `3000` | Porta HTTP |
| `UPLOADS_DIR` | `uploads/` | Diretório de armazenamento de imagens |

## Testes

Testes unitários (`pnpm test:api`) não precisam de banco — mocke a cadeia de queries do Drizzle. Testes e2e (`pnpm test:e2e`) precisam do Postgres rodando e usam o banco `code_connect_test` (criado e migrado pelo `test/global-setup.ts`).
