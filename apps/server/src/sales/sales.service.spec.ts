import { Car } from '@/car/entities/car.entity';
import type { TokenPayload } from '@/user/auth/auth.service';
import { UserRole } from '@/user/entities/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CarStatus } from '@repo/api/car-status';
import { SalesService } from './sales.service';

const salesPersonId = 'sales-uuid';

const salesPersonPayload: TokenPayload = {
  sub: salesPersonId,
  email: 'sales@example.com',
  roles: [UserRole.SALES_PERSON],
  typ: 'access',
  tokenVersion: 0,
};

const ownerPayload: TokenPayload = {
  sub: 'owner-uuid',
  email: 'owner@example.com',
  roles: [UserRole.OWNER],
  typ: 'access',
  tokenVersion: 0,
};

const createQueryBuilderMock = () => ({
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  addOrderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
});

describe('SalesService', () => {
  let service: SalesService;
  let carRepository: { createQueryBuilder: jest.Mock };

  beforeEach(async () => {
    carRepository = { createQueryBuilder: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: getRepositoryToken(Car), useValue: carRepository },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('restricts a sales person to their own sales', async () => {
      const queryBuilder = createQueryBuilderMock();
      carRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findAll(
        { page: 1, limit: 20, sortOrder: 'DESC' },
        salesPersonPayload,
      );

      expect(queryBuilder.where).toHaveBeenCalledWith('car.status = :status', {
        status: CarStatus.SOLD,
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'salesPerson.id = :salesPersonId',
        { salesPersonId },
      );
    });

    it('ignores a requested sales person filter for sales people', async () => {
      const queryBuilder = createQueryBuilderMock();
      carRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findAll(
        { page: 1, limit: 20, sortOrder: 'DESC', salesPersonId: 'other-uuid' },
        salesPersonPayload,
      );

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'salesPerson.id = :salesPersonId',
        { salesPersonId },
      );
      expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(
        'salesPerson.id = :salesPersonId',
        { salesPersonId: 'other-uuid' },
      );
    });

    it('returns all sales for the owner when no filter is given', async () => {
      const queryBuilder = createQueryBuilderMock();
      carRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findAll(
        { page: 1, limit: 20, sortOrder: 'DESC' },
        ownerPayload,
      );

      expect(queryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('applies the sales person filter for the owner when given', async () => {
      const queryBuilder = createQueryBuilderMock();
      carRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findAll(
        { page: 1, limit: 20, sortOrder: 'DESC', salesPersonId },
        ownerPayload,
      );

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'salesPerson.id = :salesPersonId',
        { salesPersonId },
      );
    });
  });
});
