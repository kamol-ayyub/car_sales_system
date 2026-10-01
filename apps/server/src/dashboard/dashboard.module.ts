import { Car } from '@/car/entities/car.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Car])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
