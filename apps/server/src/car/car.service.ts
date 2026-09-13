import { User, UserRole } from '@/user/entities/user.entity';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCarDto } from './dto/create-car.dto';
import { SellCarDto } from './dto/sell-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Car, CarStatus } from './entities/car.entity';

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

    const car = this.carRepository.create({
      ...createCarDto,
      salesPerson,
    });
    return this.carRepository.save(car);
  }

  async findAll(): Promise<Car[]> {
    return this.carRepository.find({
      relations: { salesPerson: true, client: true },
    });
  }

  async findOne(id: string): Promise<Car> {
    const car = await this.carRepository.findOne({
      where: { id },
      relations: { salesPerson: true, client: true },
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

  async sell(
    carId: string,
    salesPersonId: string,
    sellCarDto: SellCarDto,
  ): Promise<Car> {
    const car = await this.carRepository.findOne({
      where: { id: carId, status: CarStatus.AVAILABLE },
      relations: { salesPerson: true, client: true },
    });

    if (!car) {
      throw new NotFoundException(`Car with id ${carId} not found`);
    }

    if (car.status === CarStatus.SOLD) {
      throw new ConflictException(`Car with id ${carId} is already sold`);
    }

    const client = await this.getClient(sellCarDto.clientId);
    const salesPerson = await this.getSalesPerson(salesPersonId);

    car.status = CarStatus.SOLD;
    car.client = client;
    car.salesPerson = salesPerson;
    car.soldAt = new Date();
    car.salePrice = sellCarDto.salePrice ?? car.price;

    return this.carRepository.save(car);
  }

  private async getClient(userId: string): Promise<User> {
    const user = await this.userRepository.findOneBy({
      id: userId,
      roles: UserRole.CLIENT,
    });

    if (!user) {
      throw new NotFoundException(`Client with id ${userId} does not exist`);
    }

    if (!user.roles.includes(UserRole.CLIENT)) {
      throw new BadRequestException(`User with id ${userId} is not a client`);
    }

    return user;
  }

  private async getSalesPerson(userId: string): Promise<User> {
    const user = await this.userRepository.findOneBy({
      id: userId,
      roles: UserRole.SALES_PERSON,
    });
    if (!user) {
      throw new NotFoundException(
        `Sales person with id ${userId} does not exist`,
      );
    }
    if (!user.roles.includes(UserRole.SALES_PERSON)) {
      throw new BadRequestException(
        `User with id ${userId} is not a sales person`,
      );
    }
    return user;
  }
}
