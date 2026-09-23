import { paginate } from '@/common/pagination/paginate';
import { User, UserRole } from '@/user/entities/user.entity';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CarStatus } from '@repo/api/car-status';
import { type Paginated } from '@repo/api/pagination';
import { ArrayContains, Repository } from 'typeorm';
import { CreateCarDto } from './dto/create-car.dto';
import { ListCarsQueryDto } from './dto/list-cars-query.dto';
import { SellCarDto } from './dto/sell-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Car } from './entities/car.entity';

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createCarDto: CreateCarDto,
    salesPersonId: string,
  ): Promise<Car> {
    const salesPerson = await this.getSeller(salesPersonId);

    const car = this.carRepository.create({
      ...createCarDto,
      salesPerson,
    });
    return this.carRepository.save(car);
  }

  async findAll(query: ListCarsQueryDto): Promise<Paginated<Car>> {
    const qb = this.carRepository
      .createQueryBuilder('car')
      .leftJoinAndSelect('car.salesPerson', 'salesPerson')
      .leftJoinAndSelect('car.client', 'client');

    if (query.status) {
      qb.andWhere('car.status = :status', { status: query.status });
    }

    if (query.salesPersonId) {
      qb.andWhere('salesPerson.id = :salesPersonId', {
        salesPersonId: query.salesPersonId,
      });
    }

    return paginate(qb, query, { searchColumns: ['brand', 'model', 'vin'] });
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

    return this.carRepository.save(car);
  }

  async remove(id: string): Promise<void> {
    const result = await this.carRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Car with id ${id} not found`);
    }
  }

  async unsell(id: string): Promise<Car> {
    const car = await this.carRepository.findOne({
      where: { id },
      relations: { salesPerson: true, client: true },
    });

    if (!car) {
      throw new NotFoundException(`Car with id ${id} not found`);
    }

    if (car.status !== CarStatus.SOLD) {
      throw new BadRequestException(`Car with id ${id} is not sold`);
    }

    car.status = CarStatus.AVAILABLE;
    car.client = null;
    car.salePrice = null;
    car.soldAt = null;

    return this.carRepository.save(car);
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
    const salesPerson = await this.getSeller(salesPersonId);

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
      roles: ArrayContains([UserRole.CLIENT]),
    });

    if (!user) {
      throw new NotFoundException(`Client with id ${userId} does not exist`);
    }

    if (!user.roles.includes(UserRole.CLIENT)) {
      throw new BadRequestException(`User with id ${userId} is not a client`);
    }

    return user;
  }

  private async getSeller(userId: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException(`Seller with id ${userId} does not exist`);
    }

    const canSell =
      user.roles.includes(UserRole.SALES_PERSON) ||
      user.roles.includes(UserRole.OWNER);

    if (!canSell) {
      throw new BadRequestException(
        `User with id ${userId} cannot record sales`,
      );
    }

    return user;
  }
}
