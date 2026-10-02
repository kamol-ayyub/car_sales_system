import type { TokenPayload } from '@/user/auth/auth.service';
import { UserRole } from '@/user/entities/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

describe('SalesController', () => {
  let controller: SalesController;
  let service: { findAll: jest.Mock };

  const currentUser: TokenPayload = {
    sub: 'sales-uuid',
    email: 'sales@example.com',
    roles: [UserRole.SALES_PERSON],
    typ: 'access',
    tokenVersion: 0,
  };

  beforeEach(async () => {
    service = { findAll: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [{ provide: SalesService, useValue: service }],
    }).compile();

    controller = module.get<SalesController>(SalesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates to the service with the current user', async () => {
    const query = { page: 1, limit: 20, sortOrder: 'DESC' as const };
    service.findAll.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
    });

    const result = await controller.findAll(query, currentUser);

    expect(service.findAll).toHaveBeenCalledWith(query, currentUser);
    expect(result.data).toEqual([]);
  });
});
