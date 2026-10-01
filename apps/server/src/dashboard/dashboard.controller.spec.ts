import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: { getOwnerDashboard: jest.Mock };

  beforeEach(async () => {
    service = {
      getOwnerDashboard: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: service }],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates to the service', async () => {
    service.getOwnerDashboard.mockResolvedValue({ revenue: 0 });

    await expect(controller.getOwnerDashboard()).resolves.toEqual({
      revenue: 0,
    });
    expect(service.getOwnerDashboard).toHaveBeenCalled();
  });
});
