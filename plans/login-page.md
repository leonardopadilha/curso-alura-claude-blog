# Página de Login — Code Connect (apps/web)

## Contexto
`apps/web` ainda é o template padrão do Vite (sem Tailwind, sem testes, sem rotas). Vamos implementar a tela de Login do layout Figma (card escuro centralizado com banner à esquerda e formulário à direita, fundo com o "elo" do logo em marca d'água), seguindo Atomic Design, Tailwind e "todo componente tem teste" (CLAUDE.md). A página de Cadastro virá depois com o mesmo layout, outro banner e outro formulário — então o layout vira um **template** parametrizado e as partes comuns (social login, link de troca de página) viram molecules/organisms reutilizáveis.

## 1. Infra do web app
- **Tailwind v4**: `tailwindcss` + `@tailwindcss/vite` no [vite.config.ts](apps/web/vite.config.ts). Substituir [index.css](apps/web/src/index.css) por `@import "tailwindcss";` + bloco `@theme` com tokens do design:
  - `--color-cc-bg: #00090E` (fundo), `--color-cc-surface: #171D1F` (card), `--color-cc-accent: #81FE88` (verde), `--color-cc-input: #888888`, `--color-cc-text: #E1E1E1`, `--color-cc-muted: #888888`, `--font-sans: "Prompt", sans-serif`.
  - Fonte Prompt via `<link>` do Google Fonts no [index.html](apps/web/index.html) (+ `lang="pt-BR"`, título "Code Connect").
- **Testes**: `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`. Bloco `test` no vite.config (`globals: true`, `environment: 'jsdom'`, `setupFiles: './src/test/setup.ts'`), script `"test": "vitest run"` no package do web e `test:web` no [package.json](package.json) raiz. Adicionar `vitest/globals` + `@testing-library/jest-dom` em `types` do tsconfig.app.
- **Rotas**: `react-router` (v7) com `/login` (e `/` redirecionando para `/login`). `/cadastro` fica para depois, mas o link "Crie seu cadastro!" já aponta para lá.
- Remover boilerplate: `App.css`, `src/assets/{hero.png,react.svg,vite.svg}`, `public/icons.svg`.

## 2. Assets
Os PDFs em `public/` são impressões do navegador (cabeçalho/rodapé do Figma), não servem como `<img>`.
- **Banner**: extrair a imagem raster embutida em `banner-login.pdf` com um script Python no scratchpad (`pip install pypdf` → `page.images`), salvar em `apps/web/src/assets/banner-login.png` (importado via Vite). Conferir visualmente o resultado.
- **GitHub / Google**: ícones como SVG inline (marcas oficiais) em atoms de ícone — nítidos e sem request extra. Mesmo procedimento de extração serve de fallback se preferir a imagem exata do PDF.
- Remover os PDFs de `public/` após extrair (não devem ir para o bundle).

## 3. Componentes (src/components, cada um com `X.test.tsx` ao lado)

**atoms/**
- `Button` — variantes `primary` (verde, texto escuro) ; aceita `icon`, `type`, `...props`.
- `Input` — campo cinza arredondado; repassa props/ref (`forwardRef` não é necessário no React 19, `ref` é prop).
- `Label`, `Heading` (`h1`/`h2` via prop `as`), `Text`.
- `Checkbox` — checkbox estilizado com `accent-cc-accent` + label.
- `TextLink` — wrapper do `Link` do react-router (variantes `underline` / `accent`).
- `icons/` — `GithubIcon`, `GoogleIcon`, `ArrowRightIcon`, `ClipboardIcon`, `ChainLinkDecoration` (o "elo" do fundo).

**molecules/**
- `FormField` — `Label` + `Input` com `id` ligando ambos (`useId`).
- `DividerWithText` — "ou entre com outras contas".
- `SocialButton` — ícone + legenda ("Github", "Gmail"), `onClick`.
- `AuthSwitchPrompt` — pergunta + link com ícone ("Ainda não tem conta?" / "Crie seu cadastro!"); no Cadastro vira "Já tem conta? Faça seu login!".

**organisms/**
- `SocialLogin` — `DividerWithText` + lista de `SocialButton` (props `onGithub`, `onGoogle`). Reusado no Cadastro.
- `LoginForm` — título "Login", subtítulo "Boas-vindas! Faça seu login.", `FormField` email/usuário e senha (`required`), linha `Checkbox` "Lembrar-me" + `TextLink` "Esqueci a senha", `Button` "Login →". Estado controlado; prop `onSubmit({ identifier, password, remember })` (sem backend ainda — página só faz `console.info`/TODO até existir a API).

**templates/**
- `AuthTemplate` — props `banner: { src, alt }`, `children` (formulário) e `footer?` (social + prompt). Renderiza fundo `cc-bg` com `ChainLinkDecoration` nos cantos (sup. esq. e inf. dir., opacidade baixa, `aria-hidden`), card `cc-surface` arredondado com banner à esquerda e coluna de conteúdo à direita. Responsivo: abaixo de `md` o banner é ocultado e o card ocupa a largura com gutter de 16px.

**pages/**
- `LoginPage` — `AuthTemplate` com banner de login, `LoginForm`, `SocialLogin` e `AuthSwitchPrompt` → `/cadastro`.

O futuro `RegisterPage` = `AuthTemplate` + `banner-cadastro` + `RegisterForm` novo + os mesmos `SocialLogin`/`AuthSwitchPrompt`.

## 4. Testes (essenciais por componente)
- Atoms: renderizam, props principais (variante/disabled/type), clique do Button, checkbox alterna.
- `FormField`: label associado ao input (`getByLabelText`).
- `SocialButton` / `SocialLogin`: chamam os callbacks ao clicar.
- `AuthSwitchPrompt` / `TextLink`: renderizam dentro de `MemoryRouter` com `href` correto.
- `LoginForm`: digitar com `user-event` e submeter chama `onSubmit` com `{ identifier, password, remember }`; campos vazios não submetem.
- `AuthTemplate`: renderiza banner (alt) e children.
- `LoginPage`: smoke test com título "Login" e link para `/cadastro`.

## Verificação
1. `pnpm --filter web test` — todos os testes verdes.
2. `pnpm lint:web` e `pnpm build` sem erros.
3. `pnpm dev:web` e abrir `http://localhost:5173/login`: comparar com o PDF do layout (1920px) e checar largura de celular (~375px) sem scroll horizontal.
