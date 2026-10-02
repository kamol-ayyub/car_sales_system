import { Car } from '@/car/entities/car.entity';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CarStatus } from '@repo/api/car-status';
import { ReportsService } from './reports.service';

const createQueryBuilderMock = () => ({
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  innerJoin: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  addGroupBy: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  addOrderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  getRawOne: jest.fn(),
  getRawMany: jest.fn().mockResolvedValue([]),
});

describe('ReportsService', () => {
  let service: ReportsService;
  let carRepository: { createQueryBuilder: jest.Mock };

  beforeEach(async () => {
    carRepository = { createQueryBuilder: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: getRepositoryToken(Car), useValue: carRepository },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOwnerReports', () => {
    it('aggregates sold cars within the requested range', async () => {
      const queryBuilders = Array.from({ length: 5 }, createQueryBuilderMock);
      let index = 0;
      carRepository.createQueryBuilder.mockImplementation(
        () => queryBuilders[index++],
      );

      const [summaryQb, trendQb, salespeopleQb, brandsQb, topClientsQb] =
        queryBuilders;
      summaryQb.getRawOne.mockResolvedValue({
        revenue: '45000.00',
        units_sold: '3',
        avg_sale_price: '15000.00',
      });
      trendQb.getRawMany.mockResolvedValue([
        {
          period: new Date('2026-05-01T00:00:00Z'),
          revenue: '20000.00',
          units: '1',
        },
        {
          period: new Date('2026-05-02T00:00:00Z'),
          revenue: '25000.00',
          units: '2',
        },
      ]);
      salespeopleQb.getRawMany.mockResolvedValue([
        {
          id: 'sales-uuid',
          name: 'Sales Person',
          units: '3',
          revenue: '45000.00',
          avg_sale_price: '15000.00',
        },
      ]);
      brandsQb.getRawMany.mockResolvedValue([
        { brand: 'Toyota', units: '2', revenue: '30000.00' },
      ]);
      topClientsQb.getRawMany.mockResolvedValue([
        {
          id: 'client-uuid',
          name: 'Client',
          purchases: '2',
          total_spent: '30000.00',
        },
      ]);

      const result = await service.getOwnerReports({
        from: '2026-05-01',
        to: '2026-05-31',
      });

      expect(summaryQb.where).toHaveBeenCalledWith('car.status = :status', {
        status: CarStatus.SOLD,
      });
      expect(summaryQb.andWhere).toHaveBeenCalledWith(
        'car.soldAt BETWEEN :from AND :to',
        {
          from: new Date('2026-05-01T00:00:00.000Z'),
          to: new Date('2026-05-31T23:59:59.999Z'),
        },
      );
      expect(salespeopleQb.innerJoin).toHaveBeenCalledWith(
        'car.salesPerson',
        'salesPerson',
      );
      expect(topClientsQb.innerJoin).toHaveBeenCalledWith(
        'car.client',
        'client',
      );
      expect(topClientsQb.limit).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        groupBy: 'day',
        summary: { revenue: 45000, unitsSold: 3, avgSalePrice: 15000 },
        revenueOverTime: [
          { period: '2026-05-01', revenue: 20000, units: 1 },
          { period: '2026-05-02', revenue: 25000, units: 2 },
        ],
        salespeople: [
          {
            salesPerson: { id: 'sales-uuid', name: 'Sales Person' },
            units: 3,
            revenue: 45000,
            avgSalePrice: 15000,
          },
        ],
        brands: [{ brand: 'Toyota', units: 2, revenue: 30000 }],
        topClients: [
          {
            client: { id: 'client-uuid', name: 'Client' },
            purchases: 2,
            totalSpent: 30000,
          },
        ],
      });
    });

    it('returns zeroed metrics when there are no sales', async () => {
      const queryBuilders = Array.from({ length: 5 }, createQueryBuilderMock);
      let index = 0;
      carRepository.createQueryBuilder.mockImplementation(
        () => queryBuilders[index++],
      );

      const result = await service.getOwnerReports({
        from: '2026-05-01',
        to: '2026-05-31',
      });

      expect(result).toEqual({
        groupBy: 'day',
        summary: { revenue: 0, unitsSold: 0, avgSalePrice: 0 },
        revenueOverTime: [],
        salespeople: [],
        brands: [],
        topClients: [],
      });
    });

    it('uses day buckets for ranges up to 62 days', async () => {
      const queryBuilders = Array.from({ length: 5 }, createQueryBuilderMock);
      let index = 0;
      carRepository.createQueryBuilder.mockImplementation(
        () => queryBuilders[index++],
      );

      const result = await service.getOwnerReports({
        from: '2026-05-01',
        to: '2026-05-31',
      });

      expect(result.groupBy).toBe('day');
    });

    it('uses week buckets for ranges up to two years', async () => {
      const queryBuilders = Array.from({ length: 5 }, createQueryBuilderMock);
      let index = 0;
      carRepository.createQueryBuilder.mockImplementation(
        () => queryBuilders[index++],
      );

      const result = await service.getOwnerReports({
        from: '2026-01-01',
        to: '2026-12-31',
      });

      expect(result.groupBy).toBe('week');
    });

    it('uses month buckets for multi-year ranges', async () => {
      const queryBuilders = Array.from({ length: 5 }, createQueryBuilderMock);
      let index = 0;
      carRepository.createQueryBuilder.mockImplementation(
        () => queryBuilders[index++],
      );

      const result = await service.getOwnerReports({
        from: '2024-01-01',
        to: '2026-12-31',
      });

      expect(result.groupBy).toBe('month');
    });

    it('rejects a range where from is after to', async () => {
      await expect(
        service.getOwnerReports({ from: '2026-06-01', to: '2026-05-01' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
