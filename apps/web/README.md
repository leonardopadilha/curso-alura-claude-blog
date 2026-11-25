# CodeConnect — Web

Frontend da plataforma CodeConnect. React 19 + Vite 8 + TypeScript + Tailwind CSS v4.

## Stack

- **React 19** — UI com lazy loading por rota
- **Vite 8** — bundler e dev server (proxy `/v1` e `/uploads` para a API)
- **Tailwind CSS v4** (CSS-first config) — estilização via utility classes
- **React Router** — roteamento client-side
- **Vitest** + **Testing Library** — testes unitários de componentes
- **oxlint** — linter

## Estrutura

```
src/
├── components/
│   ├── atoms/        # Button, Input, Tag, Avatar, PostThumbnail, Logo…
│   ├── molecules/    # AuthorBadge, PostCover, CodeBlock, CommentItem, SearchBox…
│   ├── organisms/    # SideMenu, PostCard, PostGrid, PostForm, CommentSection…
│   ├── templates/    # AppTemplate, AuthTemplate
│   └── pages/        # FeedPage, PostPage, PublishPage, LoginPage, SignupPage
├── routes/
│   ├── AppLayout.tsx   # Layout compartilhado (SideMenu + Outlet)
│   └── RequireAuth.tsx # Guard de rota; redireciona para /login com state.from
├── hooks/
│   ├── useSession.ts   # Estado de autenticação (token storage)
│   └── useAuthGuard.ts # Encerra sessão em 401
├── services/
│   ├── api.ts          # Funções de chamada à API (tipos espelham o backend)
│   └── tokenStorage.ts # Persiste e notifica sobre o access token
└── index.css           # Paleta de cores (@theme), reset, fonte
```

## Rotas

| Rota | Componente | Auth |
|---|---|---|
| `/` | FeedPage | pública |
| `/posts/:id` | PostPage | pública |
| `/publicar` | PublishPage | obrigatória |
| `/login` | LoginPage | — |
| `/cadastro` | SignupPage | — |

Feed e detalhes de posts são públicos. Curtir, comentar e publicar exigem login. Visitantes que tentam essas ações são enviados para `/login` com `state.from` para retornar após autenticar.

## Comandos

```bash
# a partir da raiz do monorepo
pnpm dev:web      # vite dev (porta 5173)
pnpm build:web    # tsc -b && vite build
pnpm lint:web     # oxlint
pnpm test:web     # vitest run
```

## Paleta de cores

Definida em `src/index.css` com `@theme` (Tailwind v4). Use sempre por nome, nunca hex direto:

| Token | Hex | Uso |
|---|---|---|
| `grafite` | `#00090e` | fundo principal |
| `cinza-escuro` | `#171d1f` | cards, inputs |
| `cinza-medio` | `#888888` | texto secundário |
| `cinza-claro` | `#bcbcbc` | bordas, placeholders |
| `offwhite` | `#e1e1e1` | texto principal |
| `verde-petroleo` | `#132e35` | menu lateral |
| `verde-destaque` | `#81fe88` | ações, destaques |
| `decoracao` | `#0d1f22` | fundo decorativo |
| `erro` | `#ff6b6b` | mensagens de erro |

## Convenções

- **Atomic Design:** dependências só fluem para baixo (atom → molecule → organism → template → page).
- **Todo componente tem teste** colocado ao lado do arquivo (`Component.test.tsx`).
- **Sem hex hardcoded** em classes ou inline styles — use os tokens da paleta.
- **Sem font sizes arbitrários** — use a escala padrão do Tailwind (`text-sm`, `text-lg`, etc.).
- **Posts sem thumbnail** renderizam o componente `PostThumbnail` com placeholder `</>`.
