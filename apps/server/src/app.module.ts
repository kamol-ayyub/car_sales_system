import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { CarModule } from '@/car/car.module';
import { Car } from '@/car/entities/car.entity';
import { appConfigSchema } from '@/config/config.types';
import { authConfig } from '@/config/auth.config';
import { TypedConfigService } from '@/config/typed-config.service';
import { typeOrmConfig } from '@/config/typeorm.config';
import { User } from '@/user/entities/user.entity';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const dbConfig =
          configService.get<TypeOrmModuleOptions>('database') ?? {};
        return {
          ...dbConfig,
          entities: [Car, User],
        };
      },
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeOrmConfig, authConfig],
      validate: (config: Record<string, unknown>) => {
        const result = appConfigSchema.safeParse(config);
        if (!result.success) {
          throw new Error(`Config validation error: ${result.error.message}`);
        }
        return result.data;
      },
    }),
    CarModule,
    UserModule,
  ],

  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: TypedConfigService,
      useExisting: ConfigService,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
  ],
})
export class AppModule {}
