import { PasswordHasher } from '@nestjs/authentication';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/app.setup.js';

const ana = { name: 'Ana Souza', email: 'ana@exemplo.com', password: 'segredo123' };

describe('Users and auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      // Hasher barato nos testes (o padrão usa scrypt com N=2^17).
      .overrideProvider(PasswordHasher)
      .useValue(new PasswordHasher({ logN: 10 }))
      .compile();

    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const register = (body: object = ana) =>
    request(app.getHttpServer()).post('/v1/users').send(body);
  const login = (body: object = { email: ana.email, password: ana.password }) =>
    request(app.getHttpServer()).post('/v1/auth/token').send(body);

  describe('POST /v1/users', () => {
    it('creates the user: 201, Location header and no password in the body', async () => {
      const response = await register().expect(201);

      expect(response.body).toEqual({
        id: expect.any(String),
        name: ana.name,
        email: ana.email,
      });
      expect(response.headers.location).toBe(`/v1/users/${response.body.id}`);
      expect(JSON.stringify(response.body)).not.toMatch(/password|hash/i);
    });

    it('returns 409 for an email that is already registered', async () => {
      await register().expect(201);
      const response = await register({ ...ana, email: 'ANA@exemplo.com' }).expect(409);
      expect(response.body).toMatchObject({ statusCode: 409 });
    });

    it('reports every missing field as required, not as "undefined"', async () => {
      const response = await register({}).expect(400);

      expect(response.body.message).toEqual([
        'name: Field is required',
        'email: Field is required',
        'password: Field is required',
      ]);
    });

    it('keeps the specific message when a field is present but invalid', async () => {
      const response = await register({ ...ana, email: 'nao-e-email', password: '123' }).expect(400);

      expect(response.body.message).toEqual([
        'email: Invalid email address',
        expect.stringMatching(/^password: .*>=8 characters/),
      ]);
    });

    it.each([
      ['a missing name', { ...ana, name: undefined }],
      ['an invalid email', { ...ana, email: 'nao-e-email' }],
      ['a short password', { ...ana, password: '1234567' }],
    ])('returns 400 for %s', async (_label, body) => {
      const response = await register(body).expect(400);
      expect(response.body).toMatchObject({ statusCode: 400 });
    });
  });

  describe('POST /v1/auth/token', () => {
    beforeEach(async () => {
      await register().expect(201);
    });

    it('returns a JWT for valid credentials', async () => {
      const response = await login().expect(200);

      expect(response.body).toEqual({
        accessToken: expect.stringMatching(/^[\w-]+\.[\w-]+\.[\w-]+$/),
        tokenType: 'Bearer',
        expiresIn: 900,
      });
    });

    it('accepts the email in a different case', async () => {
      await login({ email: 'ANA@Exemplo.com', password: ana.password }).expect(200);
    });

    it('returns 401 for a wrong password and for an unknown email alike', async () => {
      const wrongPassword = await login({ email: ana.email, password: 'errada123' }).expect(401);
      const unknownEmail = await login({ email: 'outra@exemplo.com', password: ana.password }).expect(401);

      expect(wrongPassword.body).toEqual(unknownEmail.body);
    });

    it('returns 400 for a malformed body, flagging missing fields as required', async () => {
      const response = await login({ email: 'nao-e-email' }).expect(400);

      expect(response.body.message).toEqual([
        'email: Invalid email address',
        'password: Field is required',
      ]);
    });
  });

  describe('GET /v1/users/me', () => {
    it('returns the logged user for a valid token', async () => {
      const created = await register().expect(201);
      const { body: token } = await login().expect(200);

      const response = await request(app.getHttpServer())
        .get('/v1/users/me')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .expect(200);

      expect(response.body).toEqual({ id: created.body.id, name: ana.name, email: ana.email });
    });

    it('returns 401 without a token', async () => {
      await request(app.getHttpServer()).get('/v1/users/me').expect(401);
    });

    it('returns 401 for a malformed or tampered token', async () => {
      await register().expect(201);
      const { body: token } = await login().expect(200);

      await request(app.getHttpServer())
        .get('/v1/users/me')
        .set('Authorization', 'Bearer lixo')
        .expect(401);
      await request(app.getHttpServer())
        .get('/v1/users/me')
        .set('Authorization', `Bearer ${token.accessToken}x`)
        .expect(401);
    });
  });

  describe('OpenAPI document', () => {
    it('documents the three endpoints with their inputs and outputs', async () => {
      const { body: doc } = await request(app.getHttpServer()).get('/docs-json').expect(200);

      // A URL base (com o prefixo /v1) vem de `servers`; as rotas aparecem sem ele.
      expect(doc.servers[0].url).toMatch(/^http:\/\/localhost:\d+\/v1$/);
      expect(Object.keys(doc.paths)).toEqual(
        expect.arrayContaining(['/users', '/auth/token', '/users/me']),
      );

      const create = doc.paths['/users'].post;
      expect(create.requestBody.content['application/json'].schema.properties).toHaveProperty('password');
      expect(Object.keys(create.responses)).toEqual(expect.arrayContaining(['201', '400', '409']));

      const token = doc.paths['/auth/token'].post;
      expect(token.requestBody.content['application/json'].schema.properties).toHaveProperty('email');
      expect(token.responses['200'].content['application/json'].schema.properties).toHaveProperty('accessToken');

      const me = doc.paths['/users/me'].get;
      expect(me.security).toEqual([{ bearer: [] }]);
      expect(me.responses['200'].content['application/json'].schema.properties).toHaveProperty('email');
      expect(doc.components.securitySchemes).toHaveProperty('bearer');
    });
  });
});
