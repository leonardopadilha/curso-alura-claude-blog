# CodeConnect

Plataforma para desenvolvedores compartilharem posts com trechos de código, curtidas e comentários. Monorepo com API NestJS e frontend React.

## Estrutura

```
code-connect/
├── apps/
│   ├── api/        # NestJS 12 — REST API, Postgres, Drizzle ORM
│   └── web/        # React 19 + Vite — SPA com Tailwind CSS
├── .github/
│   └── workflows/
│       ├── ci.yml       # Lint, testes, build e code review automático
│       └── claude.yml   # Claude Code Actions (@claude em PRs/issues)
└── docker-compose.yml   # Postgres local
```

## Pré-requisitos

- Node.js 22+
- pnpm 10+
- Docker (para o Postgres local)

## Instalação

```bash
pnpm install
```

## Banco de dados

```bash
pnpm db:up        # sobe o Postgres via Docker
pnpm db:migrate   # aplica as migrations
pnpm db:seed      # cria usuários e posts mockados
```

Para recriar o seed do zero:

```bash
pnpm db:seed -- --force
```

## Desenvolvimento

```bash
pnpm dev          # API (porta 3000) + Web (porta 5173) em paralelo
pnpm dev:api      # só a API
pnpm dev:web      # só o frontend
```

O frontend faz proxy de `/v1` e `/uploads` para `http://localhost:3000`, sem precisar configurar CORS.

## Testes

```bash
pnpm test:api     # unit tests da API (Vitest, sem banco)
pnpm test:web     # unit tests do frontend (Vitest + Testing Library)
pnpm --filter api test:e2e   # e2e da API (requer banco rodando)
```

## Build

```bash
pnpm build        # compila API (NestJS) e Web (Vite) em paralelo
```

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `DATABASE_URL` | docker compose local | URL de conexão com o Postgres |
| `JWT_SECRET` | aleatório por processo | Segredo do JWT (mín. 32 bytes em produção) |
| `PORT` | `3000` | Porta da API |
| `UPLOADS_DIR` | `apps/api/uploads` | Diretório de uploads de imagens |

Em produção todas são obrigatórias. Em desenvolvimento o banco local do docker compose é usado automaticamente e um `JWT_SECRET` aleatório é gerado por processo.

## Funcionalidades

- **Feed público** — lista de posts com busca full text, filtro por tags e ordenação por recentes ou populares
- **Detalhes do post** — título, descrição, trecho de código, curtidas e comentários com um nível de resposta
- **Publicar post** — somente usuários autenticados; upload de thumbnail opcional (PNG, JPEG ou WebP, máx. 2 MB)
- **Curtir / comentar** — somente usuários autenticados; curtida é idempotente
- **Autenticação** — cadastro + login com JWT (access token, 15 min); rotas protegidas por guard global
- **Placeholder de thumbnail** — posts sem imagem exibem `</>` no lugar da foto

## CI/CD

O pipeline do GitHub Actions (`ci.yml`) roda em todo push e PR para `main`:

1. **Lint** — oxlint com type-aware rules em API e Web
2. **Unit Tests** — Vitest em API e Web
3. **E2E Tests** — Vitest com Postgres 16 (service container)
4. **Build** — compila ambos e publica os artefatos
5. **Claude Code Review** — revisão automática do diff em cada PR (após lint e testes passarem)

Para o review automático funcionar, adicione o secret `ANTHROPIC_API_KEY` em **Settings → Secrets and variables → Actions** do repositório.

O `claude.yml` permite chamar o Claude diretamente em comentários de PRs e issues com `@claude`.

## Convenções

Veja [`CLAUDE.md`](./CLAUDE.md) para as convenções completas de código (Atomic Design, Tailwind, REST, Drizzle, Conventional Commits, etc.).
