import { StandardSchemaValidationPipe, type INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { API_PREFIX } from './config/api.js';

/** Configuração da aplicação, compartilhada por `main.ts` e pelos testes e2e. */
export function setupApp(app: INestApplication): void {
  app.setGlobalPrefix(API_PREFIX);
  // Valida só parâmetros que declaram `schema` (Standard Schema/Zod).
  app.useGlobalPipes(new StandardSchemaValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Code Connect API')
    .setDescription('Cadastro, login (JWT) e dados do usuário logado.')
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
