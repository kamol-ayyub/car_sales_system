import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CarStatus } from '@repo/api/car-status';
import { Car } from '@/car/entities/car.entity';
import { User, UserRole } from '@/user/entities/user.entity';
import { DashboardService } from './dashboard.service';

const salesPerson: User = {
  id: 'sales-uuid',
  name: 'Sales Person',
  email: 'sales@example.com',
  phone: null,
  passwordHash: 'hashed',
  roles: [UserRole.SALES_PERSON],
  createdAt: new Date(),
  updatedAt: new Date(),
  purchases: [],
  sales: [],
};

const client: User = {
  id: 'client-uuid',
  name: 'Client',
  email: 'client@example.com',
  phone: null,
  passwordHash: 'hashed',
  roles: [UserRole.CLIENT],
  createdAt: new Date(),
  updatedAt: new Date(),
  purchases: [],
  sales: [],
};

const soldCar: Car = {
  id: 'sold-uuid',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2022,
  price: 20000,
  salePrice: '18500',
  vin: 'VIN12345678901234',
  status: CarStatus.SOLD,
  images: [],
  salesPerson,
  client,
  soldAt: new Date('2026-01-15T10:00:00Z'),
  createdAt: new Date(),
  updatedAt: new Date(),
};

interface QueryBuilderMock {
  leftJoin: jest.Mock;
  innerJoin: jest.Mock;
  select: jest.Mock;
  addSelect: jest.Mock;
  where: jest.Mock;
  andWhere: jest.Mock;
  groupBy: jest.Mock;
  addGroupBy: jest.Mock;
  orderBy: jest.Mock;
  addOrderBy: jest.Mock;
  limit: jest.Mock;
  getRawOne: jest.Mock;
  getRawMany: jest.Mock;
}

describe('DashboardService', () => {
  let service: DashboardService;
  let carRepository: {
    count: jest.Mock;
    find: jest.Mock;
    createQueryBuilder: jest.Mock;
  };

  beforeEach(async () => {
    carRepository = {
      count: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getRepositoryToken(Car), useValue: carRepository },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOwnerDashboard', () => {
    it('aggregates metrics across the full dataset', async () => {
      carRepository.count.mockImplementation(
        ({ where }: { where: { status: CarStatus } }) =>
          Promise.resolve(where.status === CarStatus.SOLD ? 12 : 88),
      );

      const queryBuilder: QueryBuilderMock = {
        leftJoin: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
        getRawMany: jest.fn(),
      };
      carRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      queryBuilder.getRawOne
        .mockResolvedValueOnce({ count: '4' })
        .mockResolvedValueOnce({ revenue: '45000.00' });
      queryBuilder.getRawMany.mockResolvedValueOnce([
        { brand: 'Toyota', count: '30' },
        { brand: 'Honda', count: '12' },
      ]);
      carRepository.find.mockResolvedValueOnce([{ ...soldCar }]);

      const result = await service.getOwnerDashboard();

      expect(carRepository.count).toHaveBeenCalledWith({
        where: { status: CarStatus.SOLD },
      });
      expect(carRepository.count).toHaveBeenCalledWith({
        where: { status: CarStatus.AVAILABLE },
      });
      expect(carRepository.find).toHaveBeenCalledWith({
        where: { status: CarStatus.SOLD },
        relations: { client: true, salesPerson: true },
        order: { soldAt: 'DESC' },
        take: 5,
      });
      expect(result).toEqual({
        revenue: 45000,
        soldCarsCount: 12,
        availableCarsCount: 88,
        teamSize: 4,
        recentSales: [
          {
            id: 'sold-uuid',
            brand: 'Toyota',
            model: 'Corolla',
            soldAt: '2026-01-15T10:00:00.000Z',
            salePrice: 18500,
            client: { id: 'client-uuid', name: 'Client' },
            salesPerson: { id: 'sales-uuid', name: 'Sales Person' },
          },
        ],
        topBrands: [
          { brand: 'Toyota', count: 30 },
          { brand: 'Honda', count: 12 },
        ],
      });
    });

    it('returns zeroed metrics when there are no cars', async () => {
      carRepository.count.mockResolvedValue(0);

      const queryBuilder: QueryBuilderMock = {
        leftJoin: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      carRepository.createQueryBuilder.mockReturnValue(queryBuilder);
      carRepository.find.mockResolvedValue([]);

      const result = await service.getOwnerDashboard();

      expect(result).toEqual({
        revenue: 0,
        soldCarsCount: 0,
        availableCarsCount: 0,
        teamSize: 0,
        recentSales: [],
        topBrands: [],
      });
    });
  });

  describe('getSalespersonDashboard', () => {
    it('aggregates the salesperson metrics across the full dataset', async () => {
      carRepository.count.mockImplementation(
        ({ where }: { where: { status: CarStatus } }) =>
          Promise.resolve(where.status === CarStatus.SOLD ? 7 : 88),
      );

      const queryBuilder: QueryBuilderMock = {
        leftJoin: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ revenue: '120000.00' }),
        getRawMany: jest.fn().mockResolvedValue([
          { id: 'sales-uuid', name: 'Sales Person', count: '12' },
          { id: 'other-uuid', name: 'Other Seller', count: '5' },
        ]),
      };
      carRepository.createQueryBuilder.mockReturnValue(queryBuilder);
      carRepository.find.mockResolvedValueOnce([{ ...soldCar }]);

      const result = await service.getSalespersonDashboard('sales-uuid');

      expect(carRepository.count).toHaveBeenCalledWith({
        where: { status: CarStatus.SOLD, salesPerson: { id: 'sales-uuid' } },
      });
      expect(carRepository.count).toHaveBeenCalledWith({
        where: { status: CarStatus.AVAILABLE },
      });
      expect(carRepository.find).toHaveBeenCalledWith({
        where: { status: CarStatus.SOLD, salesPerson: { id: 'sales-uuid' } },
        relations: { client: true },
        order: { soldAt: 'DESC' },
        take: 5,
      });
      expect(result).toEqual({
        mySalesCount: 7,
        myRevenue: 120000,
        availableCarsCount: 88,
        recentSales: [
          {
            id: 'sold-uuid',
            brand: 'Toyota',
            model: 'Corolla',
            soldAt: '2026-01-15T10:00:00.000Z',
            salePrice: 18500,
            client: { id: 'client-uuid', name: 'Client' },
          },
        ],
        standings: [
          { id: 'sales-uuid', name: 'Sales Person', count: 12 },
          { id: 'other-uuid', name: 'Other Seller', count: 5 },
        ],
      });
    });
  });
});
