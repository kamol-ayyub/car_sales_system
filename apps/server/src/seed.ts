import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserRole } from './user/entities/user.entity';
import { UserService } from './user/user.service';

async function bootstrap() {
  const logger = new Logger('Seeder');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userService = app.get(UserService);

    const ownerEmail = process.env.INITIAL_OWNER_EMAIL || 'owner@carsales.com';
    const ownerPassword = process.env.INITIAL_OWNER_PASSWORD || 'OwnerPass123!';

    const existingOwner = await userService.findByEmail(ownerEmail);

    if (existingOwner) {
      logger.warn(`Owner account (${ownerEmail}) already exists. Skipping.`);
    } else {
      await userService.create({
        name: 'Dealership Owner',
        email: ownerEmail,
        password: ownerPassword,
        phone: '+1234567890',
        roles: [UserRole.OWNER],
      });

      logger.log('✅ Owner created successfully!');
      logger.log(`📧 Email:    ${ownerEmail}`);
      logger.log(`🔑 Password: ${ownerPassword}`);
    }
  } catch (error) {
    logger.error('Failed to seed database:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

bootstrap();
