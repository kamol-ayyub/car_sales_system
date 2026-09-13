import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { AuthConfig } from '@/config/auth.config';
import { TokenPayload } from './auth/auth.service';
import { UserService } from './user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly authConfig: AuthConfig['jwt'];

  constructor(
    private jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    this.authConfig = this.configService.get<AuthConfig>('auth')!.jwt;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: TokenPayload }>();
    const token = this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: this.authConfig.accessSecret,
        issuer: this.authConfig.issuer,
        audience: this.authConfig.audience,
      });

      if (payload.typ !== 'access') {
        throw new UnauthorizedException();
      }

      const user = await this.userService.findById(payload.sub);
      if (!user || user.tokenVersion !== payload.tokenVersion) {
        throw new UnauthorizedException();
      }

      request.user = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
