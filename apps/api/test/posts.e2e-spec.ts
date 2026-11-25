import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { resolveUploadsDir } from '../src/config/uploads.config.js';
import { createTestApp, resetDatabase } from './create-test-app.js';

const ana = { name: 'Ana Souza', email: 'ana@exemplo.com', password: 'segredo123' };
const bia = { name: 'Bia Lima', email: 'bia@exemplo.com', password: 'segredo123' };

// PNG mínimo válido (1x1) para o upload.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

describe('Posts, likes, comments and uploads (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
    await resetDatabase(app);
  });

  afterEach(async () => {
    await app.close();
  });

  const http = () => request(app.getHttpServer());

  /** Cadastra, loga e devolve o header de autorização. */
  async function signIn(user: typeof ana) {
    await http().post('/v1/users').send(user).expect(201);
    const { body } = await http()
      .post('/v1/auth/token')
      .send({ email: user.email, password: user.password })
      .expect(200);
    return `Bearer ${body.accessToken}`;
  }

  async function publish(auth: string, body: object) {
    const response = await http().post('/v1/posts').set('Authorization', auth).send(body).expect(201);
    return response.body as { id: string };
  }

  describe('POST /v1/posts', () => {
    it('publishes a post as the logged user and returns 201 with Location', async () => {
      const auth = await signIn(ana);
      const response = await http()
        .post('/v1/posts')
        .set('Authorization', auth)
        .send({
          title: '  React zero to hero ',
          description: 'Um projeto de estudo',
          code: 'const a = 1',
          tags: ['React', ' react ', 'Front-end'],
        })
        .expect(201);

      expect(response.headers.location).toBe(`/v1/posts/${response.body.id}`);
      expect(response.body).toMatchObject({
        title: 'React zero to hero',
        description: 'Um projeto de estudo',
        code: 'const a = 1',
        thumbnailUrl: null,
        tags: ['react', 'front-end'],
        author: { name: 'Ana Souza' },
        likesCount: 0,
        commentsCount: 0,
        likedByMe: false,
      });
    });

    it('requires login', async () => {
      await http().post('/v1/posts').send({ title: 'x', description: 'y' }).expect(401);
    });

    it('reports missing and invalid fields', async () => {
      const auth = await signIn(ana);
      const response = await http()
        .post('/v1/posts')
        .set('Authorization', auth)
        .send({ thumbnailUrl: 'javascript:alert(1)' })
        .expect(400);
      const messages = response.body.message.join('\n');
      expect(messages).toContain('title: Field is required');
      expect(messages).toContain('description: Field is required');
      expect(messages).toContain('thumbnailUrl');
    });
  });

  describe('GET /v1/posts (open to visitors)', () => {
    it('lists posts without a token, newest first, with counters', async () => {
      const auth = await signIn(ana);
      await publish(auth, { title: 'Primeiro', description: 'um' });
      await publish(auth, { title: 'Segundo', description: 'dois' });

      const response = await http().get('/v1/posts').expect(200);

      expect(response.body.total).toBe(2);
      expect(response.body.items.map((post: { title: string }) => post.title)).toEqual([
        'Segundo',
        'Primeiro',
      ]);
      expect(response.body.items[0]).not.toHaveProperty('code');
    });

    it('paginates', async () => {
      const auth = await signIn(ana);
      for (const title of ['A', 'B', 'C']) await publish(auth, { title, description: title });

      const response = await http().get('/v1/posts?limit=2&page=2').expect(200);

      expect(response.body).toMatchObject({ total: 3, page: 2, limit: 2 });
      expect(response.body.items).toHaveLength(1);
    });

    it('searches with full text (stemming, accents and word prefixes)', async () => {
      const auth = await signIn(ana);
      await publish(auth, {
        title: 'Componentes acessíveis',
        description: 'Foco em acessibilidade e teclado',
      });
      await publish(auth, { title: 'API com NestJS', description: 'Autenticação e Postgres' });

      const titles = async (search: string) => {
        const { body } = await http().get('/v1/posts').query({ search }).expect(200);
        return body.items.map((post: { title: string }) => post.title);
      };

      expect(await titles('acessibilidade')).toEqual(['Componentes acessíveis']);
      expect(await titles('acessib')).toEqual(['Componentes acessíveis']);
      expect(await titles('postgre nest')).toEqual(['API com NestJS']);
      expect(await titles('inexistente')).toEqual([]);
    });

    it('treats operators in the search text as plain words', async () => {
      const auth = await signIn(ana);
      await publish(auth, { title: 'React', description: 'hooks' });

      await http().get('/v1/posts').query({ search: "react' | !(& :*" }).expect(200);
      await http().get('/v1/posts').query({ search: '!!!' }).expect(200);
    });

    it('filters by tags (all of them) and combines with the search', async () => {
      const auth = await signIn(ana);
      await publish(auth, { title: 'Um', description: 'a', tags: ['react', 'front-end'] });
      await publish(auth, { title: 'Dois', description: 'b', tags: ['react'] });

      const both = await http().get('/v1/posts?tags=React,front-end').expect(200);
      expect(both.body.items.map((p: { title: string }) => p.title)).toEqual(['Um']);

      const combined = await http().get('/v1/posts').query({ tags: 'react', search: 'dois' }).expect(200);
      expect(combined.body.items.map((p: { title: string }) => p.title)).toEqual(['Dois']);
    });

    it('sorts by popularity', async () => {
      const auth = await signIn(ana);
      const bobAuth = await signIn(bia);
      const quiet = await publish(auth, { title: 'Quieto', description: 'a' });
      const loved = await publish(auth, { title: 'Querido', description: 'b' });
      await http().put(`/v1/posts/${loved.id}/likes/me`).set('Authorization', auth).expect(200);
      await http().put(`/v1/posts/${loved.id}/likes/me`).set('Authorization', bobAuth).expect(200);
      expect(quiet.id).toBeDefined();

      const response = await http().get('/v1/posts?sort=popular').expect(200);

      expect(response.body.items.map((p: { title: string }) => p.title)).toEqual(['Querido', 'Quieto']);
    });

    it('marks what the logged user liked', async () => {
      const auth = await signIn(ana);
      const post = await publish(auth, { title: 'Meu', description: 'a' });
      await http().put(`/v1/posts/${post.id}/likes/me`).set('Authorization', auth).expect(200);

      const logged = await http().get('/v1/posts').set('Authorization', auth).expect(200);
      const visitor = await http().get('/v1/posts').expect(200);

      expect(logged.body.items[0]).toMatchObject({ likesCount: 1, likedByMe: true });
      expect(visitor.body.items[0]).toMatchObject({ likesCount: 1, likedByMe: false });
    });

    it('rejects an invalid token even on an open route', async () => {
      await http().get('/v1/posts').set('Authorization', 'Bearer invalido').expect(401);
    });

    it('rejects invalid query parameters', async () => {
      await http().get('/v1/posts?limit=999').expect(400);
      await http().get('/v1/posts?sort=x').expect(400);
    });
  });

  describe('GET /v1/posts/:id', () => {
    it('returns the post with its code, without a token', async () => {
      const auth = await signIn(ana);
      const post = await publish(auth, { title: 'Detalhe', description: 'a', code: 'let x' });

      const response = await http().get(`/v1/posts/${post.id}`).expect(200);

      expect(response.body).toMatchObject({ id: post.id, title: 'Detalhe', code: 'let x' });
    });

    it('returns 404 for an unknown post and 400 for a malformed id', async () => {
      await http().get('/v1/posts/00000000-0000-4000-8000-000000000000').expect(404);
      await http().get('/v1/posts/abc').expect(400);
    });
  });

  describe('likes', () => {
    it('requires login to like or unlike', async () => {
      const auth = await signIn(ana);
      const post = await publish(auth, { title: 'P', description: 'a' });

      await http().put(`/v1/posts/${post.id}/likes/me`).expect(401);
      await http().delete(`/v1/posts/${post.id}/likes/me`).expect(401);
    });

    it('likes idempotently and unlikes', async () => {
      const auth = await signIn(ana);
      const post = await publish(auth, { title: 'P', description: 'a' });
      const url = `/v1/posts/${post.id}/likes/me`;

      const first = await http().put(url).set('Authorization', auth).expect(200);
      const again = await http().put(url).set('Authorization', auth).expect(200);
      const removed = await http().delete(url).set('Authorization', auth).expect(200);

      expect(first.body).toEqual({ likesCount: 1, likedByMe: true });
      expect(again.body).toEqual({ likesCount: 1, likedByMe: true });
      expect(removed.body).toEqual({ likesCount: 0, likedByMe: false });
    });

    it('returns 404 when the post does not exist', async () => {
      const auth = await signIn(ana);
      await http()
        .put('/v1/posts/00000000-0000-4000-8000-000000000000/likes/me')
        .set('Authorization', auth)
        .expect(404);
    });
  });

  describe('comments', () => {
    it('lists comments without a token, oldest first', async () => {
      const auth = await signIn(ana);
      const post = await publish(auth, { title: 'P', description: 'a' });
      await http().post(`/v1/posts/${post.id}/comments`).set('Authorization', auth).send({ content: 'um' }).expect(201);
      await http().post(`/v1/posts/${post.id}/comments`).set('Authorization', auth).send({ content: 'dois' }).expect(201);

      const response = await http().get(`/v1/posts/${post.id}/comments`).expect(200);

      expect(response.body.items.map((c: { content: string }) => c.content)).toEqual(['um', 'dois']);
      expect(response.body.items[0]).toMatchObject({ parentId: null, author: { name: 'Ana Souza' } });
    });

    it('requires login to comment', async () => {
      const auth = await signIn(ana);
      const post = await publish(auth, { title: 'P', description: 'a' });

      await http().post(`/v1/posts/${post.id}/comments`).send({ content: 'oi' }).expect(401);
    });

    it('creates a comment with 201 and Location, and counts it on the post', async () => {
      const auth = await signIn(ana);
      const post = await publish(auth, { title: 'P', description: 'a' });

      const response = await http()
        .post(`/v1/posts/${post.id}/comments`)
        .set('Authorization', auth)
        .send({ content: '  Muito bom!  ' })
        .expect(201);

      expect(response.headers.location).toBe(`/v1/posts/${post.id}/comments/${response.body.id}`);
      expect(response.body).toMatchObject({ content: 'Muito bom!', postId: post.id, parentId: null });
      const detail = await http().get(`/v1/posts/${post.id}`).expect(200);
      expect(detail.body.commentsCount).toBe(1);
    });

    it('replies with one level only (a reply to a reply goes under the root comment)', async () => {
      const auth = await signIn(ana);
      const post = await publish(auth, { title: 'P', description: 'a' });
      const url = `/v1/posts/${post.id}/comments`;
      const root = await http().post(url).set('Authorization', auth).send({ content: 'raiz' }).expect(201);
      const reply = await http().post(url).set('Authorization', auth).send({ content: 'resposta', parentId: root.body.id }).expect(201);
      const nested = await http().post(url).set('Authorization', auth).send({ content: 'tréplica', parentId: reply.body.id }).expect(201);

      expect(reply.body.parentId).toBe(root.body.id);
      expect(nested.body.parentId).toBe(root.body.id);
    });

    it('rejects a parent from another post with 422', async () => {
      const auth = await signIn(ana);
      const one = await publish(auth, { title: 'Um', description: 'a' });
      const two = await publish(auth, { title: 'Dois', description: 'b' });
      const comment = await http().post(`/v1/posts/${one.id}/comments`).set('Authorization', auth).send({ content: 'oi' }).expect(201);

      await http()
        .post(`/v1/posts/${two.id}/comments`)
        .set('Authorization', auth)
        .send({ content: 'oi', parentId: comment.body.id })
        .expect(422);
    });

    it('validates the content', async () => {
      const auth = await signIn(ana);
      const post = await publish(auth, { title: 'P', description: 'a' });

      const response = await http().post(`/v1/posts/${post.id}/comments`).set('Authorization', auth).send({}).expect(400);

      expect(response.body.message).toContain('content: Field is required');
    });
  });

  describe('GET /v1/tags', () => {
    it('lists the most used tags', async () => {
      const auth = await signIn(ana);
      await publish(auth, { title: 'A', description: 'a', tags: ['react', 'css'] });
      await publish(auth, { title: 'B', description: 'b', tags: ['react'] });

      const response = await http().get('/v1/tags').expect(200);

      expect(response.body.items).toEqual([
        { name: 'react', count: 2 },
        { name: 'css', count: 1 },
      ]);
    });
  });

  describe('POST /v1/uploads', () => {
    it('saves an image, serves it publicly and lets a post use it as thumbnail', async () => {
      const auth = await signIn(ana);

      const upload = await http()
        .post('/v1/uploads')
        .set('Authorization', auth)
        .attach('file', PNG, { filename: 'capa.png', contentType: 'image/png' })
        .expect(201);

      expect(upload.body.url).toMatch(/^\/uploads\/[0-9a-f-]{36}\.png$/);
      expect(upload.headers.location).toBe(upload.body.url);
      const served = await http().get(upload.body.url).expect(200);
      expect(served.headers['x-content-type-options']).toBe('nosniff');
      expect(Buffer.compare(served.body, await readFile(join(resolveUploadsDir(), upload.body.url.split('/').pop())))).toBe(0);

      const post = await http()
        .post('/v1/posts')
        .set('Authorization', auth)
        .send({ title: 'Com capa', description: 'a', thumbnailUrl: upload.body.url })
        .expect(201);
      expect(post.body.thumbnailUrl).toBe(upload.body.url);
    });

    it('requires login', async () => {
      await http().post('/v1/uploads').attach('file', PNG, 'capa.png').expect(401);
    });

    it('rejects files that are not images, even with an image Content-Type', async () => {
      const auth = await signIn(ana);
      await http()
        .post('/v1/uploads')
        .set('Authorization', auth)
        .attach('file', Buffer.from('<script>alert(1)</script>'), { filename: 'x.png', contentType: 'image/png' })
        .expect(415);
    });

    it('rejects a request without file and files above 2 MB', async () => {
      const auth = await signIn(ana);
      await http().post('/v1/uploads').set('Authorization', auth).field('x', 'y').expect(400);
      await http()
        .post('/v1/uploads')
        .set('Authorization', auth)
        .attach('file', Buffer.alloc(2 * 1024 * 1024 + 1), { filename: 'g.png', contentType: 'image/png' })
        .expect(413);
    });
  });

  describe('OpenAPI document', () => {
    it('documents the new endpoints', async () => {
      const { body: doc } = await http().get('/docs-json').expect(200);

      expect(Object.keys(doc.paths)).toEqual(
        expect.arrayContaining([
          '/posts',
          '/posts/{id}',
          '/posts/{id}/likes/me',
          '/posts/{id}/comments',
          '/tags',
          '/uploads',
        ]),
      );
      const names = doc.paths['/posts'].get.parameters.map((p: { name: string }) => p.name);
      expect(names).toEqual(expect.arrayContaining(['search', 'tags', 'sort', 'page', 'limit']));
    });
  });
});
