import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CarService } from './car.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { SellCarDto } from './dto/sell-car.dto';
import { Public } from '@/user/decorators/public.decorator';
import { Roles } from '@/user/decorators/roles.decorator';
import { CurrentUserId } from '@/user/decorators/current-user-id.decorator';
import { UserRole } from '@/user/entities/user.entity';
import { FindOneParams } from '@/common/dto/find-one.params';

@Controller('car')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Post()
  create(@Body() createCarDto: CreateCarDto) {
    return this.carService.create(createCarDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.carService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param() { id }: FindOneParams) {
    return this.carService.findOne(id);
  }

  @Patch(':id')
  update(@Param() { id }: FindOneParams, @Body() updateCarDto: UpdateCarDto) {
    return this.carService.update(id, updateCarDto);
  }

  @Delete(':id')
  remove(@Param() { id }: FindOneParams) {
    return this.carService.remove(id);
  }

  @Post(':id/sell')
  @Roles(UserRole.SALES_PERSON, UserRole.OWNER)
  sell(
    @Param() { id }: FindOneParams,
    @CurrentUserId() salesPersonId: string,
    @Body() sellCarDto: SellCarDto,
  ) {
    return this.carService.sell(id, salesPersonId, sellCarDto);
  }
}
