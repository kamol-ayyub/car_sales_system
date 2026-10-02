import { Car } from '@/car/entities/car.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

@Module({
  imports: [TypeOrmModule.forFeature([Car])],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
