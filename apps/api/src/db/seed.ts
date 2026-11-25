import { PasswordHasher } from '@nestjs/authentication';
import { drizzle } from 'drizzle-orm/node-postgres';
import { resolveDatabaseUrl } from '../config/database.config.js';
import { comments, postLikes, posts, users } from './schema.js';

/**
 * Popula o banco com usuários, posts, curtidas e comentários de exemplo.
 *
 *   pnpm db:seed           só roda se ainda não houver posts
 *   pnpm db:seed --force   apaga os posts (e curtidas/comentários) e popula de novo
 *
 * Os usuários de exemplo usam a senha de `SEED_PASSWORD` (padrão `senha12345`).
 */

const SEED_USERS = [
  { name: 'Júlio Andrade', email: 'julio@codeconnect.dev' },
  { name: 'Márcia Lima', email: 'marcia@codeconnect.dev' },
  { name: 'Gabriel Luz', email: 'gabriel@codeconnect.dev' },
  { name: 'Marcela Lins', email: 'marcela@codeconnect.dev' },
  { name: 'Ana Souza', email: 'ana@codeconnect.dev' },
];

const REACT_SNIPPET = `function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount((value) => value + 1)}>
      Cliques: {count}
    </button>
  )
}`;

const COMPOSE_SNIPPET = `const pluckDeep = key => obj => key.split('.').reduce((accum, key) => accum[key], obj)

const compose = (...fns) => res => fns.reduce((accum, next) => next(accum), res)

const unfold = (f, seed) => {
  const go = (f, seed, acc) => {
    const res = f(seed)
    return res ? go(f, res[1], acc.concat([res[0]])) : acc
  }
  return go(f, seed, [])
}`;

const CSS_SNIPPET = `.card {
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 0.5rem;
  background: var(--cinza-escuro);
}`;

const SQL_SNIPPET = `select p.title, count(l.user_id) as curtidas
from posts p
left join post_likes l on l.post_id = p.id
group by p.id
order by curtidas desc
limit 10;`;

type SeedPost = { title: string; description: string; tags: string[]; code?: string };

const SEED_POSTS: SeedPost[] = [
  { title: 'Componentes React acessíveis do zero', description: 'Como construí uma biblioteca de componentes com foco em acessibilidade: foco visível, rótulos corretos e navegação completa pelo teclado.', tags: ['react', 'acessibilidade', 'front-end'], code: REACT_SNIPPET },
  { title: 'Dashboard financeiro com gráficos interativos', description: 'Painel com dados em tempo real, filtros por período e exportação em CSV. Usei React, TypeScript e uma API em Node.', tags: ['react', 'typescript', 'dashboard'] },
  { title: 'Design system com Tailwind CSS', description: 'Paleta, tipografia e componentes documentados a partir de tokens do Figma, tudo configurado no tema do Tailwind.', tags: ['tailwind', 'design-system', 'front-end'], code: CSS_SNIPPET },
  { title: 'API REST com NestJS e Postgres', description: 'Autenticação com JWT, validação com Zod, documentação no Swagger e persistência com Drizzle ORM.', tags: ['nestjs', 'postgres', 'back-end'], code: SQL_SNIPPET },
  { title: 'Programação funcional em JavaScript', description: 'Composição de funções, currying e recursão com exemplos curtos que você pode colar no console e testar.', tags: ['javascript', 'funcional'], code: COMPOSE_SNIPPET },
  { title: 'Aplicativo de receitas em React Native', description: 'Busca de receitas por ingrediente, lista de favoritos que funciona offline e modo escuro.', tags: ['react-native', 'mobile'] },
  { title: 'Busca full text com PostgreSQL', description: 'tsvector, índices GIN e ranking de resultados: uma busca rápida sem precisar de um serviço externo.', tags: ['postgres', 'busca', 'back-end'], code: SQL_SNIPPET },
  { title: 'Testes de interface com Testing Library', description: 'Teste o comportamento que o usuário percebe, não os detalhes de implementação dos componentes.', tags: ['testes', 'react', 'front-end'] },
  { title: 'Animações CSS sem JavaScript', description: 'Transições, keyframes e scroll-driven animations para interfaces fluidas e leves.', tags: ['css', 'animacao', 'front-end'], code: CSS_SNIPPET },
  { title: 'Docker Compose para ambiente de desenvolvimento', description: 'Subindo banco, API e front com um único comando, com volumes para manter os dados entre execuções.', tags: ['docker', 'devops'] },
  { title: 'Landing page com foco em performance', description: 'Lighthouse acima de 95: imagens otimizadas, fontes locais e carregamento sob demanda de cada página.', tags: ['performance', 'front-end', 'react'] },
  { title: 'Autenticação com JWT: boas práticas', description: 'Expiração curta, armazenamento seguro, hash de senha com scrypt e tratamento correto de erros 401.', tags: ['seguranca', 'jwt', 'back-end'] },
  { title: 'Gerenciando estado com Zustand', description: 'Um estado global simples, tipado e sem boilerplate, comparado ao Redux Toolkit e ao Context API.', tags: ['react', 'estado', 'typescript'], code: REACT_SNIPPET },
  { title: 'Formulários com validação em Zod', description: 'Um único schema valida o formulário no front e a API no back, com mensagens de erro em português.', tags: ['zod', 'typescript', 'formularios'] },
  { title: 'Git: fluxo de trabalho em equipe', description: 'Commits convencionais, pull requests pequenos e revisão de código que realmente ajuda quem escreveu.', tags: ['git', 'carreira'] },
  { title: 'Layouts responsivos com CSS Grid', description: 'Do celular ao desktop sem media queries em excesso, usando minmax, auto-fit e container queries.', tags: ['css', 'responsivo', 'front-end'], code: CSS_SNIPPET },
  { title: 'Primeiros passos com TypeScript', description: 'Tipos básicos, generics e utilitários como Partial, Pick e Omit com exemplos do dia a dia.', tags: ['typescript', 'iniciantes'] },
  { title: 'Monitorando uma API em produção', description: 'Logs estruturados, métricas e alertas: como descobrir um problema antes que o usuário reclame.', tags: ['observabilidade', 'back-end', 'devops'] },
];

const COMMENT_TEXTS = [
  'Achei muito bom seu código, parabéns!',
  'Quanto tempo você levou para finalizar esse projeto?',
  'Espero chegar um dia nesse nível! Muito bom!',
  'Ficou ótimo, vou testar na minha aplicação.',
  'Você poderia explicar melhor a parte dos testes?',
  'Excelente explicação, salvei para ler com calma.',
];

const REPLY_TEXTS = [
  'Até que foi rápido, uns 3 dias!',
  'Obrigado! Se precisar de ajuda é só falar.',
  'Claro, vou escrever um post só sobre isso.',
];

/** Gerador pseudoaleatório determinístico: o seed produz sempre os mesmos dados. */
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

async function main() {
  const force = process.argv.includes('--force');
  const db = drizzle(resolveDatabaseUrl());

  try {
    const count = await db.$count(posts);
    if (count > 0 && !force) {
      console.log(`Já existem ${count} posts. Use "pnpm db:seed --force" para recriá-los.`);
      return;
    }
    if (force) await db.delete(posts);

    const password = process.env.SEED_PASSWORD ?? 'senha12345';
    const passwordHash = await new PasswordHasher().hash(password);
    await db
      .insert(users)
      .values(SEED_USERS.map((user) => ({ ...user, passwordHash })))
      .onConflictDoNothing({ target: users.email });
    const authors = await db.select().from(users);
    const seeded = authors.filter((user) => SEED_USERS.some((s) => s.email === user.email));

    const random = createRandom(42);
    const pick = <T>(items: T[]) => items[Math.floor(random() * items.length)];
    const day = 24 * 60 * 60 * 1000;

    const created = await db
      .insert(posts)
      .values(
        SEED_POSTS.map((post, index) => ({
          ...post,
          authorId: pick(seeded).id,
          code: post.code ?? null,
          // Um em cada cinco posts fica sem imagem, para exercitar o placeholder do front.
          thumbnailUrl:
            index % 5 === 4 ? null : `https://picsum.photos/seed/code-connect-${index}/972/480`,
          createdAt: new Date(Date.now() - index * day - Math.floor(random() * day)),
        })),
      )
      .returning({ id: posts.id });

    const likes = created.flatMap(({ id }) =>
      seeded.filter(() => random() < 0.45).map((user) => ({ postId: id, userId: user.id })),
    );
    if (likes.length) await db.insert(postLikes).values(likes).onConflictDoNothing();

    let commentCount = 0;
    for (const { id } of created) {
      if (random() < 0.4) continue;
      const [root] = await db
        .insert(comments)
        .values({ postId: id, authorId: pick(seeded).id, content: pick(COMMENT_TEXTS) })
        .returning({ id: comments.id });
      commentCount++;
      if (random() < 0.6) {
        await db.insert(comments).values({
          postId: id,
          authorId: pick(seeded).id,
          parentId: root.id,
          content: pick(REPLY_TEXTS),
        });
        commentCount++;
      }
    }

    console.log(
      `Seed concluído: ${created.length} posts, ${likes.length} curtidas e ${commentCount} comentários.`,
    );
    console.log(`Usuários de exemplo (senha "${password}"): ${SEED_USERS.map((u) => u.email).join(', ')}`);
  } finally {
    await db.$client.end();
  }
}

await main();
