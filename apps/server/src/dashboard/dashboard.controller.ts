import { Roles } from '@/user/decorators/roles.decorator';
import { UserRole } from '@/user/entities/user.entity';
import { Controller, Get } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { DashboardService } from './dashboard.service';
import { OwnerDashboardResponse } from './dto/owner-dashboard-response';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('owner')
  @Roles(UserRole.OWNER)
  @ZodSerializerDto(OwnerDashboardResponse)
  getOwnerDashboard(): Promise<OwnerDashboardResponse> {
    return this.dashboardService.getOwnerDashboard();
  }
}
