import { StandardSchemaValidationPipe, type INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { API_PREFIX } from './config/api.js';
import { UPLOADS_PREFIX, resolveUploadsDir } from './config/uploads.config.js';

/** Configuração da aplicação, compartilhada por `main.ts` e pelos testes e2e. */
export function setupApp(app: INestApplication): void {
  app.setGlobalPrefix(API_PREFIX);
  // Valida só parâmetros que declaram `schema` (Standard Schema/Zod).
  app.useGlobalPipes(new StandardSchemaValidationPipe());

  // Imagens enviadas (thumbnails) são públicas e ficam fora do prefixo da API.
  (app as Partial<NestExpressApplication>).useStaticAssets?.(resolveUploadsDir(), {
    prefix: UPLOADS_PREFIX,
    maxAge: '7d',
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
  });

  const config = new DocumentBuilder()
    .setTitle('Code Connect API')
    .setDescription(
      'Cadastro, login (JWT), feed de posts com busca full text, curtidas, comentários e upload de imagens.',
    )
    .setVersion('1.0')
    // URL base exibida no topo do Swagger UI; cada rota aparece sem o prefixo.
    .addServer(`http://localhost:${process.env.PORT ?? 3000}/${API_PREFIX}`, 'Local')
    .addBearerAuth()
    .build();
  // Documentação em /docs (JSON em /docs-json), fora do prefixo da API.
  SwaggerModule.setup('docs', app, () =>
    SwaggerModule.createDocument(app, config, { ignoreGlobalPrefix: true }),
  );
}
