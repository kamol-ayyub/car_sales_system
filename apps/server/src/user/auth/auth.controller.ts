import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ZodSerializerDto } from 'nestjs-zod';
import { Public } from '../decorators/public.decorator';
import { RegisterDto } from './register.dto';
import { AuthService } from './auth.service';
import { LoginResponse } from './login-response';
import { LoginDto } from './login.dto';
import { RefreshTokenDto } from './refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ZodSerializerDto(LoginResponse)
  async register(@Body() registerDto: RegisterDto): Promise<LoginResponse> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ZodSerializerDto(LoginResponse)
  async login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(dto.email, dto.password);
  }

  @Public()
  @Post('refresh')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ZodSerializerDto(LoginResponse)
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<LoginResponse> {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: RefreshTokenDto): Promise<void> {
    await this.authService.logout(dto.refreshToken);
  }
}
