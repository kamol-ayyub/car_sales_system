import { Car } from '@/car/entities/car.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CarStatus } from '@repo/api/car-status';
import { Repository } from 'typeorm';
import { OwnerDashboardResponse } from './dto/owner-dashboard-response';
import { SalespersonDashboardResponse } from './dto/salesperson-dashboard-response';

const RECENT_SALES_LIMIT = 5;
const TOP_BRANDS_LIMIT = 5;

type TopBrand = { brand: string; count: number };

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
      recentSales,
      topBrands,
    };
  }

  async getSalespersonDashboard(
    userId: string,
  ): Promise<SalespersonDashboardResponse> {
    const [
      mySalesCount,
      myRevenue,
      availableCarsCount,
      recentSales,
      standings,
    ] = await Promise.all([
      this.carRepository.count({
        where: { status: CarStatus.SOLD, salesPerson: { id: userId } },
      }),
      this.sumSalespersonRevenue(userId),
      this.carRepository.count({ where: { status: CarStatus.AVAILABLE } }),
      this.findSalespersonRecentSales(userId, RECENT_SALES_LIMIT),
      this.findStandings(),
    ]);

    return {
      mySalesCount,
      myRevenue,
      availableCarsCount,
      recentSales,
      standings,
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

  private async findRecentSales(limit: number) {
    const cars = await this.carRepository.find({
      where: { status: CarStatus.SOLD },
      relations: { client: true, salesPerson: true },
      order: { soldAt: 'DESC' },
      take: limit,
    });

    return cars.map((car) => ({
      id: car.id,
      brand: car.brand,
      model: car.model,
      soldAt: car.soldAt ? car.soldAt.toISOString() : null,
      salePrice: car.salePrice != null ? Number(car.salePrice) : null,
      client: car.client ? { id: car.client.id, name: car.client.name } : null,
      salesPerson: car.salesPerson
        ? { id: car.salesPerson.id, name: car.salesPerson.name }
        : null,
    }));
  }

  private async sumSalespersonRevenue(userId: string): Promise<number> {
    const row = await this.carRepository
      .createQueryBuilder('car')
      .leftJoin('car.salesPerson', 'salesPerson')
      .select('COALESCE(SUM(COALESCE(car.salePrice, car.price)), 0)', 'revenue')
      .where('car.status = :status', { status: CarStatus.SOLD })
      .andWhere('salesPerson.id = :userId', { userId })
      .getRawOne<{ revenue: string }>();

    return Number(row?.revenue ?? 0);
  }

  private async findSalespersonRecentSales(userId: string, limit: number) {
    const cars = await this.carRepository.find({
      where: { status: CarStatus.SOLD, salesPerson: { id: userId } },
      relations: { client: true },
      order: { soldAt: 'DESC' },
      take: limit,
    });

    return cars.map((car) => ({
      id: car.id,
      brand: car.brand,
      model: car.model,
      soldAt: car.soldAt ? car.soldAt.toISOString() : null,
      salePrice: car.salePrice != null ? Number(car.salePrice) : null,
      client: car.client ? { id: car.client.id, name: car.client.name } : null,
    }));
  }

  private async findStandings(): Promise<
    { id: string; name: string; count: number }[]
  > {
    const rows = await this.carRepository
      .createQueryBuilder('car')
      .innerJoin('car.salesPerson', 'salesPerson')
      .select('salesPerson.id', 'id')
      .addSelect('salesPerson.name', 'name')
      .addSelect('COUNT(*)', 'count')
      .where('car.status = :status', { status: CarStatus.SOLD })
      .groupBy('salesPerson.id')
      .addGroupBy('salesPerson.name')
      .orderBy('count', 'DESC')
      .addOrderBy('salesPerson.name', 'ASC')
      .getRawMany<{ id: string; name: string; count: string }>();

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      count: Number(row.count),
    }));
  }

  private async findTopBrands(limit: number): Promise<TopBrand[]> {
    const rows = await this.carRepository
      .createQueryBuilder('car')
      .select('car.brand', 'brand')
      .addSelect('COUNT(*)', 'count')
      .where('car.status = :status', { status: CarStatus.AVAILABLE })
      .groupBy('car.brand')
      .orderBy('count', 'DESC')
      .addOrderBy('car.brand', 'ASC')
      .limit(limit)
      .getRawMany<{ brand: string; count: string }>();

    return rows.map(({ brand, count }) => ({ brand, count: Number(count) }));
  }
}
