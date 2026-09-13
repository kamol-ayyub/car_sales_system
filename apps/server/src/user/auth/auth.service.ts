import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './register.dto';
import { User, UserRole } from '../entities/user.entity';
import { PasswordService } from '../password/password.service';
import { UserService } from '../user.service';
import { AuthConfig } from '@/config/auth.config';

export interface TokenPayload {
  sub: string;
  email: string;
  roles: UserRole[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly authConfig: AuthConfig['jwt'];

  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
  ) {
    this.authConfig = this.configService.get<AuthConfig>('auth')!.jwt;
  }

  public async register(registerDto: RegisterDto): Promise<User> {
    const isUserExist = await this.usersService.findByEmail(registerDto.email);
    if (isUserExist) {
      throw new ConflictException('Email already exists');
    }

    return this.usersService.create({
      ...registerDto,
      roles: [UserRole.CLIENT],
    });
  }

  public async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.usersService.findByEmail(email);
    if (
      !user ||
      !(await this.passwordService.verify(password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  public async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    let payload: TokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<TokenPayload>(refreshToken, {
        secret: this.authConfig.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return this.generateTokens(user);
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.authConfig.accessSecret,
        expiresIn: this.authConfig
          .accessExpiresIn as JwtSignOptions['expiresIn'],
      }),
      this.jwtService.signAsync(payload, {
        secret: this.authConfig.refreshSecret,
        expiresIn: this.authConfig
          .refreshExpiresIn as JwtSignOptions['expiresIn'],
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
