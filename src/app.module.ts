import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { CarModule } from '@/car/car.module';
import { Car } from '@/car/entities/car.entity';
import { appConfigSchema } from '@/config/config.types';
import { TypedConfigService } from '@/config/typed-config.service';
import { typeOrmConfig } from '@/config/typeorm.config';
import { User } from '@/user/entities/user.entity';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: TypedConfigService) => ({
        ...configService.get('database'),
        entities: [Car, User],
      }),
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeOrmConfig],
      validationSchema: appConfigSchema,
      validationOptions: {
        abortEarly: true,
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
  ],
})
export class AppModule {}
