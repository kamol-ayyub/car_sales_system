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
import { hashToken } from './token-hash';

export type TokenType = 'access' | 'refresh';

export interface TokenPayload {
  sub: string;
  email: string;
  roles: UserRole[];
  typ: TokenType;
  tokenVersion: number;
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

  public async register(registerDto: RegisterDto): Promise<AuthTokens> {
    const isUserExist = await this.usersService.findByEmail(registerDto.email);
    if (isUserExist) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.usersService.create({
      ...registerDto,
      roles: [UserRole.CLIENT],
    });

    return this.generateTokens(user);
  }

  public async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.usersService.findByEmail(email);
    const passwordHash =
      user?.passwordHash ?? (await this.passwordService.getDummyHash());
    const isPasswordValid = await this.passwordService.verify(
      password,
      passwordHash,
    );

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  public async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const user = await this.usersService.findById(payload.sub);

    if (!user || user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (user.refreshTokenHash !== hashToken(refreshToken)) {
      await this.usersService.incrementTokenVersion(user.id);
      await this.usersService.setRefreshTokenHash(user.id, null);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return this.generateTokens(user);
  }

  public async logout(refreshToken: string): Promise<void> {
    try {
      const payload = await this.verifyRefreshToken(refreshToken);
      const user = await this.usersService.findById(payload.sub);
      if (user && user.refreshTokenHash === hashToken(refreshToken)) {
        await this.usersService.setRefreshTokenHash(user.id, null);
      }
    } catch {
      return;
    }
  }

  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<TokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(
        refreshToken,
        {
          secret: this.authConfig.refreshSecret,
          issuer: this.authConfig.issuer,
          audience: this.authConfig.audience,
        },
      );
      if (payload.typ !== 'refresh') {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      tokenVersion: user.tokenVersion,
    };

    const signOptions = {
      issuer: this.authConfig.issuer,
      audience: this.authConfig.audience,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...payload, typ: 'access' satisfies TokenType },
        {
          ...signOptions,
          secret: this.authConfig.accessSecret,
          expiresIn: this.authConfig
            .accessExpiresIn as JwtSignOptions['expiresIn'],
        },
      ),
      this.jwtService.signAsync(
        { ...payload, typ: 'refresh' satisfies TokenType },
        {
          ...signOptions,
          secret: this.authConfig.refreshSecret,
          expiresIn: this.authConfig
            .refreshExpiresIn as JwtSignOptions['expiresIn'],
        },
      ),
    ]);

    await this.usersService.setRefreshTokenHash(
      user.id,
      hashToken(refreshToken),
    );

    return { accessToken, refreshToken };
  }
}
