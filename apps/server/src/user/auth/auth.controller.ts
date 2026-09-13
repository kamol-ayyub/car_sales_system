import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
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
  @SerializeOptions({ strategy: 'excludeAll' })
  async register(@Body() registerDto: RegisterDto): Promise<LoginResponse> {
    const tokens = await this.authService.register(registerDto);
    return new LoginResponse(tokens);
  }

  @Public()
  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @SerializeOptions({ strategy: 'excludeAll' })
  async login(@Body() dto: LoginDto): Promise<LoginResponse> {
    const tokens = await this.authService.login(dto.email, dto.password);
    return new LoginResponse(tokens);
  }

  @Public()
  @Post('refresh')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @SerializeOptions({ strategy: 'excludeAll' })
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<LoginResponse> {
    const tokens = await this.authService.refreshTokens(dto.refreshToken);
    return new LoginResponse(tokens);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: RefreshTokenDto): Promise<void> {
    await this.authService.logout(dto.refreshToken);
  }
}
