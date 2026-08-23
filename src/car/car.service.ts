import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Car } from './entities/car.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '@/user/entities/user.entity';

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createCarDto: CreateCarDto): Promise<Car> {
    const salesPerson = createCarDto.salesPersonId
      ? await this.getSalesPerson(createCarDto.salesPersonId)
      : null;

    const { salesPersonId, ...rest } = createCarDto;
    const car = this.carRepository.create({
      ...rest,
      salesPerson,
    });
    return this.carRepository.save(car);
  }

  async findAll(): Promise<Car[]> {
    return this.carRepository.find({
      relations: { salesPerson: true },
    });
  }

  async findOne(id: string): Promise<Car> {
    const car = await this.carRepository.findOne({
      where: { id },
      relations: { salesPerson: true },
    });
    if (!car) {
      throw new NotFoundException(`Car with id ${id} not found`);
    }
    return car;
  }

  async update(id: string, updateCarDto: UpdateCarDto): Promise<Car | null> {
    const car = await this.carRepository.preload({
      id,
      ...updateCarDto,
    });

    if (!car) {
      throw new NotFoundException(`Car with id ${id} not found`);
    }

    if (updateCarDto.salesPersonId) {
      car.salesPerson = await this.getSalesPerson(updateCarDto.salesPersonId);
    }
    return this.carRepository.save(car);
  }

  async remove(id: string): Promise<void> {
    const result = await this.carRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Car with id ${id} not found`);
    }
  }

  private async getSalesPerson(userId: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(
        `Sales person with id ${userId} does not exist`,
      );
    }
    if (user.role !== UserRole.SALES_PERSON) {
      throw new BadRequestException(
        `User with id ${userId} is not a sales person`,
      );
    }
    return user;
  }
}
