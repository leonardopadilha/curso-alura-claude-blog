import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { CurrentUser, Public } from '@nestjs/authentication';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import {
  badRequestSchema,
  conflictSchema,
  unauthorizedSchema,
} from '../common/error-response.schema.js';
import { API_PREFIX } from '../config/api.js';
import type { User } from './user.js';
import {
  createUserSchema,
  toUserResponse,
  userResponseSchema,
  type CreateUserRequest,
  type UserResponse,
} from './user.schema.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Cadastra um usuário' })
  @ApiCreatedResponse({
    description: 'Usuário criado. O header Location aponta para o recurso.',
    standardSchema: userResponseSchema,
    headers: {
      Location: {
        description: 'URI do usuário criado',
        schema: {
          type: 'string',
          example: `/${API_PREFIX}/users/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed`,
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Corpo inválido',
    standardSchema: badRequestSchema,
  })
  @ApiConflictResponse({
    description: 'Já existe um usuário com esse email',
    standardSchema: conflictSchema,
  })
  async create(
    @Body({ schema: createUserSchema }) body: CreateUserRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserResponse> {
    const user = await this.usersService.create(body);
    response.location(`/${API_PREFIX}/users/${user.id}`);
    return toUserResponse(user);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna os dados do usuário logado' })
  @ApiOkResponse({
    description: 'Dados do usuário dono do token',
    standardSchema: userResponseSchema,
  })
  @ApiUnauthorizedResponse({
    description: 'Token ausente, inválido ou expirado',
    standardSchema: unauthorizedSchema,
  })
  me(@CurrentUser() user: User): UserResponse {
    return toUserResponse(user);
  }
}
