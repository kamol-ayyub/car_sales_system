import { FindOneParams } from '@/common/dto/find-one.params';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './entities/user.entity';
import { UserService } from './user.service';
import type { TokenPayload } from './auth/auth.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(UserRole.OWNER)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.OWNER)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param() { id }: FindOneParams) {
    return this.userService.findOne(id, 'id');
  }

  @Patch(':id')
  update(
    @Param() { id }: FindOneParams,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    const isOwner = currentUser.roles.includes(UserRole.OWNER);
    if (currentUser.sub !== id && !isOwner) {
      throw new ForbiddenException('You can only update your own account');
    }
    return this.userService.update(id, updateUserDto);
  }

  @Patch(':id/role')
  @Roles(UserRole.OWNER)
  updateRole(
    @Param() { id }: FindOneParams,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.userService.updateRole(id, updateUserRoleDto.roles);
  }

  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param() { id }: FindOneParams) {
    return this.userService.remove(id);
  }
}
