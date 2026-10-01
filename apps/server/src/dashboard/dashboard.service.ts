import { CarStatus } from '@repo/api/car-status';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Car } from '@/car/entities/car.entity';
import { OwnerDashboardResponse } from './dto/owner-dashboard-response';

const RECENT_SALES_LIMIT = 5;
const TOP_BRANDS_LIMIT = 5;

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
  ) {}

  async getOwnerDashboard(): Promise<OwnerDashboardResponse> {
    const [
      soldCarsCount,
      availableCarsCount,
      teamSize,
      revenue,
      recentSales,
      topBrands,
    ] = await Promise.all([
      this.carRepository.count({ where: { status: CarStatus.SOLD } }),
      this.carRepository.count({ where: { status: CarStatus.AVAILABLE } }),
      this.countTeamSize(),
      this.sumRevenue(),
      this.findRecentSales(RECENT_SALES_LIMIT),
      this.findTopBrands(TOP_BRANDS_LIMIT),
    ]);

    return {
      revenue,
      soldCarsCount,
      availableCarsCount,
      teamSize,
      recentSales: recentSales.map((car) => ({
        id: car.id,
        brand: car.brand,
        model: car.model,
        soldAt: car.soldAt ? car.soldAt.toISOString() : null,
        salePrice: car.salePrice != null ? Number(car.salePrice) : null,
        client: car.client
          ? { id: car.client.id, name: car.client.name }
          : null,
        salesPerson: car.salesPerson
          ? { id: car.salesPerson.id, name: car.salesPerson.name }
          : null,
      })),
      topBrands: topBrands.map(({ brand, count }) => ({
        brand,
        count: Number(count),
      })),
    };
  }

  private async countTeamSize(): Promise<number> {
    const row = await this.carRepository
      .createQueryBuilder('car')
      .leftJoin('car.salesPerson', 'salesPerson')
      .select('COUNT(DISTINCT salesPerson.id)', 'count')
      .getRawOne<{ count: string }>();

    return Number(row?.count ?? 0);
  }

  private async sumRevenue(): Promise<number> {
    const row = await this.carRepository
      .createQueryBuilder('car')
      .select('COALESCE(SUM(COALESCE(car.salePrice, car.price)), 0)', 'revenue')
      .where('car.status = :status', { status: CarStatus.SOLD })
      .getRawOne<{ revenue: string }>();

    return Number(row?.revenue ?? 0);
  }

  private async findRecentSales(limit: number): Promise<Car[]> {
    return this.carRepository.find({
      where: { status: CarStatus.SOLD },
      relations: { client: true, salesPerson: true },
      order: { soldAt: 'DESC' },
      take: limit,
    });
  }

  private async findTopBrands(
    limit: number,
  ): Promise<Array<{ brand: string; count: string }>> {
    return this.carRepository
      .createQueryBuilder('car')
      .select('car.brand', 'brand')
      .addSelect('COUNT(*)', 'count')
      .where('car.status = :status', { status: CarStatus.AVAILABLE })
      .groupBy('car.brand')
      .orderBy('count', 'DESC')
      .addOrderBy('car.brand', 'ASC')
      .limit(limit)
      .getRawMany<{ brand: string; count: string }>();
  }
}
