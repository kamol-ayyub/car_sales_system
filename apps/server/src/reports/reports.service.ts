import { Car } from '@/car/entities/car.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CarStatus } from '@repo/api/car-status';
import { Repository } from 'typeorm';
import { OwnerReportsQueryDto } from './dto/owner-reports-query.dto';
import { OwnerReportsResponse } from './dto/owner-reports-response';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RANGE_DAYS = 30;
const DAY_BUCKET_MAX_DAYS = 62;
const WEEK_BUCKET_MAX_DAYS = 730;
const TOP_CLIENTS_LIMIT = 10;

type ReportGroupBy = 'day' | 'week' | 'month';

const toIsoDate = (value: Date | string): string => {
  const iso = value instanceof Date ? value.toISOString() : value;
  return iso.slice(0, 10);
};

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
  ) {}

  async getOwnerReports(
    query: OwnerReportsQueryDto,
  ): Promise<OwnerReportsResponse> {
    const { from, to } = this.resolveRange(query);
    const groupBy = this.resolveGroupBy(from, to);

    const [summary, revenueOverTime, salespeople, brands, topClients] =
      await Promise.all([
        this.getSummary(from, to),
        this.getRevenueOverTime(from, to, groupBy),
        this.getSalespeople(from, to),
        this.getBrands(from, to),
        this.getTopClients(from, to),
      ]);

    return {
      summary,
      revenueOverTime,
      salespeople,
      brands,
      topClients,
      groupBy,
    };
  }

  private resolveRange(query: OwnerReportsQueryDto): { from: Date; to: Date } {
    const to = query.to ? new Date(`${query.to}T23:59:59.999Z`) : new Date();
    const from = query.from
      ? new Date(`${query.from}T00:00:00.000Z`)
      : new Date(to.getTime() - DEFAULT_RANGE_DAYS * DAY_IN_MS);

    if (from.getTime() > to.getTime()) {
      throw new BadRequestException('"from" must be before or equal to "to"');
    }

    return { from, to };
  }

  private resolveGroupBy(from: Date, to: Date): ReportGroupBy {
    const rangeDays = (to.getTime() - from.getTime()) / DAY_IN_MS;
    if (rangeDays <= DAY_BUCKET_MAX_DAYS) {
      return 'day';
    }
    if (rangeDays <= WEEK_BUCKET_MAX_DAYS) {
      return 'week';
    }
    return 'month';
  }

  private soldInRange(from: Date, to: Date) {
    return this.carRepository
      .createQueryBuilder('car')
      .where('car.status = :status', { status: CarStatus.SOLD })
      .andWhere('car.soldAt BETWEEN :from AND :to', { from, to });
  }

  private async getSummary(from: Date, to: Date) {
    const row = await this.soldInRange(from, to)
      .select('COALESCE(SUM(COALESCE(car.salePrice, car.price)), 0)', 'revenue')
      .addSelect('COUNT(*)', 'units_sold')
      .addSelect(
        'COALESCE(AVG(COALESCE(car.salePrice, car.price)), 0)',
        'avg_sale_price',
      )
      .getRawOne<{
        revenue: string;
        units_sold: string;
        avg_sale_price: string;
      }>();

    return {
      revenue: Number(row?.revenue ?? 0),
      unitsSold: Number(row?.units_sold ?? 0),
      avgSalePrice: Number(row?.avg_sale_price ?? 0),
    };
  }

  private async getRevenueOverTime(
    from: Date,
    to: Date,
    groupBy: ReportGroupBy,
  ) {
    const bucket = `date_trunc('${groupBy}', car.soldAt)`;
    const rows = await this.soldInRange(from, to)
      .select(bucket, 'period')
      .addSelect(
        'COALESCE(SUM(COALESCE(car.salePrice, car.price)), 0)',
        'revenue',
      )
      .addSelect('COUNT(*)', 'units')
      .groupBy(bucket)
      .orderBy(bucket, 'ASC')
      .getRawMany<{ period: Date | string; revenue: string; units: string }>();

    return rows.map((row) => ({
      period: toIsoDate(row.period),
      revenue: Number(row.revenue),
      units: Number(row.units),
    }));
  }

  private async getSalespeople(from: Date, to: Date) {
    const rows = await this.soldInRange(from, to)
      .innerJoin('car.salesPerson', 'salesPerson')
      .select('salesPerson.id', 'id')
      .addSelect('salesPerson.name', 'name')
      .addSelect('COUNT(*)', 'units')
      .addSelect(
        'COALESCE(SUM(COALESCE(car.salePrice, car.price)), 0)',
        'revenue',
      )
      .addSelect(
        'COALESCE(AVG(COALESCE(car.salePrice, car.price)), 0)',
        'avg_sale_price',
      )
      .groupBy('salesPerson.id')
      .addGroupBy('salesPerson.name')
      .orderBy('revenue', 'DESC')
      .addOrderBy('salesPerson.name', 'ASC')
      .getRawMany<{
        id: string;
        name: string;
        units: string;
        revenue: string;
        avg_sale_price: string;
      }>();

    return rows.map((row) => ({
      salesPerson: { id: row.id, name: row.name },
      units: Number(row.units),
      revenue: Number(row.revenue),
      avgSalePrice: Number(row.avg_sale_price),
    }));
  }

  private async getBrands(from: Date, to: Date) {
    const rows = await this.soldInRange(from, to)
      .select('car.brand', 'brand')
      .addSelect('COUNT(*)', 'units')
      .addSelect(
        'COALESCE(SUM(COALESCE(car.salePrice, car.price)), 0)',
        'revenue',
      )
      .groupBy('car.brand')
      .orderBy('revenue', 'DESC')
      .addOrderBy('car.brand', 'ASC')
      .getRawMany<{ brand: string; units: string; revenue: string }>();

    return rows.map((row) => ({
      brand: row.brand,
      units: Number(row.units),
      revenue: Number(row.revenue),
    }));
  }

  private async getTopClients(from: Date, to: Date) {
    const rows = await this.soldInRange(from, to)
      .innerJoin('car.client', 'client')
      .select('client.id', 'id')
      .addSelect('client.name', 'name')
      .addSelect('COUNT(*)', 'purchases')
      .addSelect(
        'COALESCE(SUM(COALESCE(car.salePrice, car.price)), 0)',
        'total_spent',
      )
      .groupBy('client.id')
      .addGroupBy('client.name')
      .orderBy('total_spent', 'DESC')
      .addOrderBy('client.name', 'ASC')
      .limit(TOP_CLIENTS_LIMIT)
      .getRawMany<{
        id: string;
        name: string;
        purchases: string;
        total_spent: string;
      }>();

    return rows.map((row) => ({
      client: { id: row.id, name: row.name },
      purchases: Number(row.purchases),
      totalSpent: Number(row.total_spent),
    }));
  }
}
