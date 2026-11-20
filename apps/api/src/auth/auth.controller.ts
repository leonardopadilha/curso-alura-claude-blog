import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Public } from '@nestjs/authentication';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  badRequestSchema,
  unauthorizedSchema,
} from '../common/error-response.schema.js';
import { AuthService } from './auth.service.js';
import {
  loginSchema,
  tokenResponseSchema,
  type LoginRequest,
  type TokenResponse,
} from './auth.schema.js';

@ApiTags('auth')
@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token')
  @HttpCode(200)
  @ApiOperation({ summary: 'Faz login e devolve um JWT de acesso' })
  @ApiOkResponse({
    description: 'Credenciais válidas',
    standardSchema: tokenResponseSchema,
  })
  @ApiBadRequestResponse({
    description: 'Corpo inválido',
    standardSchema: badRequestSchema,
  })
  @ApiUnauthorizedResponse({
    description: 'Email ou senha incorretos',
    standardSchema: unauthorizedSchema,
  })
  login(@Body({ schema: loginSchema }) body: LoginRequest): Promise<TokenResponse> {
    return this.authService.login(body);
  }
}
