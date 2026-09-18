import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ZodSerializerDto } from 'nestjs-zod';
import type { Request, Response } from 'express';
import { Public } from '../decorators/public.decorator';
import { RegisterDto } from './register.dto';
import { AuthService, type AuthTokens } from './auth.service';
import { LoginResponse } from './login-response';
import { LoginDto } from './login.dto';
import {
  clearRefreshCookie,
  readRefreshToken,
  setRefreshCookie,
} from './refresh-cookie';

const authThrottle = { default: { limit: 5, ttl: 60_000 } };
const refreshThrottle = { default: { limit: 10, ttl: 60_000 } };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  @Throttle(authThrottle)
  @ZodSerializerDto(LoginResponse)
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    const tokens = await this.authService.register(registerDto);
    return this.respondWithTokens(res, tokens);
  }

  @Public()
  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle(authThrottle)
  @ZodSerializerDto(LoginResponse)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    const tokens = await this.authService.login(dto.email, dto.password);
    return this.respondWithTokens(res, tokens);
  }

  @Public()
  @Post('refresh')
  @UseGuards(ThrottlerGuard)
  @Throttle(refreshThrottle)
  @ZodSerializerDto(LoginResponse)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    const refreshToken = readRefreshToken(req.headers.cookie);
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokens = await this.authService.refreshTokens(refreshToken);
    return this.respondWithTokens(res, tokens);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const refreshToken = readRefreshToken(req.headers.cookie);
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    clearRefreshCookie(res);
  }

  private respondWithTokens(res: Response, tokens: AuthTokens): LoginResponse {
    setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }
}
