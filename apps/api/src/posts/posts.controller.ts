import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res } from '@nestjs/common';
import { Authenticate, CurrentUser } from '@nestjs/authentication';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import {
  badRequestSchema,
  notFoundSchema,
  unauthorizedSchema,
} from '../common/error-response.schema.js';
import { API_PREFIX } from '../config/api.js';
import type { User } from '../users/user.js';
import {
  createPostSchema,
  idParamSchema,
  likeResponseSchema,
  listPostsQuerySchema,
  postDetailSchema,
  postListSchema,
  type CreatePostRequest,
  type IdParam,
  type LikeResponse,
  type ListPostsQuery,
  type PostDetail,
  type PostList,
} from './post.schema.js';
import { PostsService } from './posts.service.js';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // Leitura aberta: sem token vale como visitante; com token inválido, 401.
  @Authenticate({ optional: true })
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lista os posts do feed',
    description:
      'Aberto a visitantes. Com token, `likedByMe` indica o que o usuário já curtiu. Filtros e busca full text são feitos pelo banco.',
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'tags', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, enum: ['recent', 'popular'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Página de posts', standardSchema: postListSchema })
  @ApiBadRequestResponse({ description: 'Parâmetros inválidos', standardSchema: badRequestSchema })
  list(
    @Query({ schema: listPostsQuerySchema }) query: ListPostsQuery,
    @CurrentUser() user: User | null,
  ): Promise<PostList> {
    return this.postsService.list(query, user?.id);
  }

  @Authenticate({ optional: true })
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna um post (aberto a visitantes)' })
  @ApiOkResponse({ description: 'Detalhes do post', standardSchema: postDetailSchema })
  @ApiBadRequestResponse({ description: 'Id inválido', standardSchema: badRequestSchema })
  @ApiNotFoundResponse({ description: 'Post inexistente', standardSchema: notFoundSchema })
  findOne(
    @Param({ schema: idParamSchema }) { id }: IdParam,
    @CurrentUser() user: User | null,
  ): Promise<PostDetail> {
    return this.postsService.findOne(id, user?.id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publica um post (exige login)' })
  @ApiCreatedResponse({
    description: 'Post criado. O header Location aponta para o recurso.',
    standardSchema: postDetailSchema,
    headers: {
      Location: {
        description: 'URI do post criado',
        schema: { type: 'string', example: `/${API_PREFIX}/posts/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed` },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Corpo inválido', standardSchema: badRequestSchema })
  @ApiUnauthorizedResponse({ description: 'Token ausente, inválido ou expirado', standardSchema: unauthorizedSchema })
  async create(
    @Body({ schema: createPostSchema }) body: CreatePostRequest,
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ): Promise<PostDetail> {
    const post = await this.postsService.create(user.id, body);
    response.location(`/${API_PREFIX}/posts/${post.id}`);
    return post;
  }

  // A curtida do usuário logado é um recurso do post: PUT cria (idempotente), DELETE remove.
  @Put(':id/likes/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Curte o post (exige login; repetir não muda nada)' })
  @ApiOkResponse({ description: 'Estado atual das curtidas', standardSchema: likeResponseSchema })
  @ApiNotFoundResponse({ description: 'Post inexistente', standardSchema: notFoundSchema })
  @ApiUnauthorizedResponse({ description: 'Token ausente, inválido ou expirado', standardSchema: unauthorizedSchema })
  like(
    @Param({ schema: idParamSchema }) { id }: IdParam,
    @CurrentUser() user: User,
  ): Promise<LikeResponse> {
    return this.postsService.like(id, user.id);
  }

  @Delete(':id/likes/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a curtida do post (exige login)' })
  @ApiOkResponse({ description: 'Estado atual das curtidas', standardSchema: likeResponseSchema })
  @ApiNotFoundResponse({ description: 'Post inexistente', standardSchema: notFoundSchema })
  @ApiUnauthorizedResponse({ description: 'Token ausente, inválido ou expirado', standardSchema: unauthorizedSchema })
  unlike(
    @Param({ schema: idParamSchema }) { id }: IdParam,
    @CurrentUser() user: User,
  ): Promise<LikeResponse> {
    return this.postsService.unlike(id, user.id);
  }
}
