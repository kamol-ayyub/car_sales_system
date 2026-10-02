import type { TokenPayload } from '@/user/auth/auth.service';
import { CurrentUser } from '@/user/decorators/current-user.decorator';
import { Roles } from '@/user/decorators/roles.decorator';
import { UserRole } from '@/user/entities/user.entity';
import { Controller, Get, Query } from '@nestjs/common';
import { ListSalesQueryDto } from './dto/list-sales-query.dto';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @Roles(UserRole.SALES_PERSON, UserRole.OWNER)
  findAll(
    @Query() query: ListSalesQueryDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.salesService.findAll(query, currentUser);
  }
}
