import { Car } from '@/car/entities/car.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([Car])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
