import { z } from 'zod';

/**
 * Formato único dos erros da API (o mesmo que o Nest já devolve). Uma função,
 * e não uma constante, para que cada resposta do Swagger traga seu exemplo.
 */
export function errorResponseSchema(
  statusCode: number,
  error: string,
  message: string | string[],
) {
  return z.object({
    statusCode: z.number().meta({ example: statusCode }),
    error: z.string().optional().meta({ example: error }),
    message: z
      .union([z.string(), z.array(z.string())])
      .meta({ example: message }),
    errorCode: z
      .string()
      .optional()
      .meta({ description: 'Código estável do erro (respostas de autenticação)' }),
  });
}

export const badRequestSchema = errorResponseSchema(400, 'Bad Request', [
  'email: Invalid email address',
]);
export const unauthorizedSchema = errorResponseSchema(401, 'Unauthorized', 'Unauthorized');
export const conflictSchema = errorResponseSchema(409, 'Conflict', 'Email already registered');
export const notFoundSchema = errorResponseSchema(404, 'Not Found', 'Post not found');
export const unprocessableSchema = errorResponseSchema(
  422,
  'Unprocessable Entity',
  'Parent comment not found in this post',
);
export const payloadTooLargeSchema = errorResponseSchema(413, 'Payload Too Large', 'File too large');
export const unsupportedMediaTypeSchema = errorResponseSchema(
  415,
  'Unsupported Media Type',
  'Only PNG, JPEG and WebP images are accepted',
);
