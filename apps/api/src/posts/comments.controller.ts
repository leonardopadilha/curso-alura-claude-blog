import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Authenticate, CurrentUser } from '@nestjs/authentication';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import {
  badRequestSchema,
  notFoundSchema,
  unauthorizedSchema,
  unprocessableSchema,
} from '../common/error-response.schema.js';
import { API_PREFIX } from '../config/api.js';
import type { User } from '../users/user.js';
import { CommentsService } from './comments.service.js';
import {
  commentListSchema,
  commentResponseSchema,
  createCommentSchema,
  idParamSchema,
  type CommentList,
  type CommentResponse,
  type CreateCommentRequest,
  type IdParam,
} from './post.schema.js';

@ApiTags('comments')
@Controller('posts/:id/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Authenticate({ optional: true })
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lista os comentários do post (aberto a visitantes)' })
  @ApiOkResponse({ description: 'Comentários e respostas', standardSchema: commentListSchema })
  @ApiNotFoundResponse({ description: 'Post inexistente', standardSchema: notFoundSchema })
  list(@Param({ schema: idParamSchema }) { id }: IdParam): Promise<CommentList> {
    return this.commentsService.list(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Comenta ou responde a um comentário (exige login)' })
  @ApiCreatedResponse({
    description: 'Comentário criado',
    standardSchema: commentResponseSchema,
    headers: {
      Location: {
        description: 'URI do comentário criado',
        schema: {
          type: 'string',
          example: `/${API_PREFIX}/posts/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed/comments/5a8c1e0f-0f3e-4d2e-9d0e-0c8f7a1b2c3d`,
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Corpo inválido', standardSchema: badRequestSchema })
  @ApiUnauthorizedResponse({ description: 'Token ausente, inválido ou expirado', standardSchema: unauthorizedSchema })
  @ApiNotFoundResponse({ description: 'Post inexistente', standardSchema: notFoundSchema })
  @ApiUnprocessableEntityResponse({
    description: '`parentId` não é um comentário deste post',
    standardSchema: unprocessableSchema,
  })
  async create(
    @Param({ schema: idParamSchema }) { id }: IdParam,
    @Body({ schema: createCommentSchema }) body: CreateCommentRequest,
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ): Promise<CommentResponse> {
    const comment = await this.commentsService.create(id, user.id, body);
    response.location(`/${API_PREFIX}/posts/${id}/comments/${comment.id}`);
    return comment;
  }
}
