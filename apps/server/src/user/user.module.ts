import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth/auth.service';
import { User } from './entities/user.entity';
import { PasswordService } from './password/password.service';
import { RolesGuard } from './roles.guard';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtModule, JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthConfig } from '@/config/auth.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60000, limit: 20 }],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const auth = config.get<AuthConfig>('auth');
        return {
          secret: auth?.jwt.accessSecret,
          signOptions: {
            expiresIn: auth?.jwt.accessExpiresIn as JwtSignOptions['expiresIn'],
            issuer: auth?.jwt.issuer,
            audience: auth?.jwt.audience,
          },
          verifyOptions: {
            issuer: auth?.jwt.issuer,
            audience: auth?.jwt.audience,
          },
        };
      },
    }),
  ],
  controllers: [UserController, AuthController],
  providers: [
    UserService,
    PasswordService,
    AuthService,
    AuthGuard,
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class UserModule {}
