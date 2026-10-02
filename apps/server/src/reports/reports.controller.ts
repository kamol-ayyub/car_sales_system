import { Roles } from '@/user/decorators/roles.decorator';
import { UserRole } from '@/user/entities/user.entity';
import { Controller, Get, Query } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { OwnerReportsQueryDto } from './dto/owner-reports-query.dto';
import { OwnerReportsResponse } from './dto/owner-reports-response';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('owner')
  @Roles(UserRole.OWNER)
  @ZodSerializerDto(OwnerReportsResponse)
  getOwnerReports(
    @Query() query: OwnerReportsQueryDto,
  ): Promise<OwnerReportsResponse> {
    return this.reportsService.getOwnerReports(query);
  }
}
