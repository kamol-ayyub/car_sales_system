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
import { Public } from '@/user/decorators/public.decorator';
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
  update(
    @Param() { id }: FindOneParams,
    @Body() updateCarDto: UpdateCarDto,
  ) {
    return this.carService.update(id, updateCarDto);
  }

  @Delete(':id')
  remove(@Param() { id }: FindOneParams) {
    return this.carService.remove(id);
  }
}
