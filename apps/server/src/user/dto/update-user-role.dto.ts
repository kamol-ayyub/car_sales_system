import { IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateUserRoleDto {
  @IsArray()
  @IsNotEmpty()
  @IsEnum(UserRole, { each: true })
  roles: UserRole[];
}
