import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: { getOwnerReports: jest.Mock };

  beforeEach(async () => {
    service = { getOwnerReports: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [{ provide: ReportsService, useValue: service }],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates to the service with the query', async () => {
    const query = { from: '2026-05-01', to: '2026-05-31' };
    service.getOwnerReports.mockResolvedValue({
      summary: { revenue: 0, unitsSold: 0, avgSalePrice: 0 },
      revenueOverTime: [],
      salespeople: [],
      brands: [],
      topClients: [],
      groupBy: 'day',
    });

    const result = await controller.getOwnerReports(query);

    expect(service.getOwnerReports).toHaveBeenCalledWith(query);
    expect(result.groupBy).toBe('day');
  });
});
