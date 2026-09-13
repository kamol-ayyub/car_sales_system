import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Request,
  SerializeOptions,
} from '@nestjs/common';
import { Public } from '../decorators/public.decorator';
import { RegisterDto } from './register.dto';
import { User } from '../entities/user.entity';
import { UserService } from '../user.service';
import { AuthService } from './auth.service';
import { LoginResponse } from './login-response';
import { LoginDto } from './login.dto';

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
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    const accessToken = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );

    return new LoginResponse({ accessToken });
  }

  @Get('profile')
  async profile(@Request() request: AuthRequest): Promise<User> {
    const user = await this.userService.findOne(request.user.sub);

    if (!user) {
      throw new NotFoundException('User not found!');
    }
    return user;
  }

  @Public()
  @Post('refresh')
  async refreshToken(@Request() request: AuthRequest) {
    const user = await this.userService.findOne(request.user.sub);
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    return this.authService.refreshToken(user);
  }
}
