import { Car } from '@/car/entities/car.entity';
import { paginate } from '@/common/pagination/paginate';
import type { TokenPayload } from '@/user/auth/auth.service';
import { UserRole } from '@/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CarStatus } from '@repo/api/car-status';
import type { Paginated } from '@repo/api/pagination';
import { Repository } from 'typeorm';
import { ListSalesQueryDto } from './dto/list-sales-query.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
  ) {}

  async findAll(
    query: ListSalesQueryDto,
    currentUser: TokenPayload,
  ): Promise<Paginated<Car>> {
    const qb = this.carRepository
      .createQueryBuilder('car')
      .leftJoinAndSelect('car.salesPerson', 'salesPerson')
      .leftJoinAndSelect('car.client', 'client')
      .where('car.status = :status', { status: CarStatus.SOLD });

    const salesPersonId = currentUser.roles.includes(UserRole.OWNER)
      ? query.salesPersonId
      : currentUser.sub;

    if (salesPersonId) {
      qb.andWhere('salesPerson.id = :salesPersonId', { salesPersonId });
    }

    return paginate(qb, query, {
      searchColumns: ['brand', 'model', 'vin'],
      sortColumn: 'sold_at',
    });
  }
}
