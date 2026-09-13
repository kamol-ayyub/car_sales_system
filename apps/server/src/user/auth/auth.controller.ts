import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  SerializeOptions,
} from '@nestjs/common';
import { Public } from '../decorators/public.decorator';
import { RegisterDto } from './register.dto';
import { User } from '../entities/user.entity';
import { UserService } from '../user.service';
import { AuthService } from './auth.service';
import { LoginResponse } from './login-response';
import { LoginDto } from './login.dto';
import { RefreshTokenDto } from './refresh-token.dto';

export type AuthRequest = {
  user: {
    sub: string;
    name: string;
  };
};

@Controller('auth')
@SerializeOptions({
  strategy: 'excludeAll',
})
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<User> {
    const user = await this.authService.register(registerDto);
    return user;
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<LoginResponse> {
    const tokens = await this.authService.login(dto.email, dto.password);
    return new LoginResponse(tokens);
  }

  @Public()
  @Post('refresh')
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<LoginResponse> {
    const tokens = await this.authService.refreshTokens(dto.refreshToken);
    return new LoginResponse(tokens);
  }
}
