import {
  BadRequestException,
  Controller,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnsupportedMediaTypeResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { z } from 'zod';
import {
  badRequestSchema,
  payloadTooLargeSchema,
  unauthorizedSchema,
  unsupportedMediaTypeSchema,
} from '../common/error-response.schema.js';
import { MAX_UPLOAD_BYTES } from '../config/uploads.config.js';
import { UploadsService } from './uploads.service.js';

const uploadResponseSchema = z.object({
  url: z.string().meta({
    description: 'Caminho público do arquivo (use como `thumbnailUrl` de um post)',
    example: '/uploads/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed.png',
  }),
});

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Envia uma imagem (exige login)',
    description: 'PNG, JPEG ou WebP de até 2 MB, no campo `file` de um `multipart/form-data`.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiCreatedResponse({
    description: 'Arquivo salvo. O header Location aponta para ele.',
    standardSchema: uploadResponseSchema,
  })
  @ApiBadRequestResponse({ description: 'Campo `file` ausente', standardSchema: badRequestSchema })
  @ApiUnauthorizedResponse({ description: 'Token ausente, inválido ou expirado', standardSchema: unauthorizedSchema })
  @ApiPayloadTooLargeResponse({ description: 'Arquivo maior que 2 MB', standardSchema: payloadTooLargeSchema })
  @ApiUnsupportedMediaTypeResponse({ description: 'Formato não suportado', standardSchema: unsupportedMediaTypeSchema })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 } }))
  async upload(
    @UploadedFile() file: { buffer: Buffer } | undefined,
    @Res({ passthrough: true }) response: Response,
  ): Promise<z.infer<typeof uploadResponseSchema>> {
    if (!file) throw new BadRequestException('Field "file" is required');
    const url = await this.uploadsService.saveImage(file.buffer);
    response.location(url);
    return { url };
  }
}
