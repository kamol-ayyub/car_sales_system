import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../dto/create-user.dto';

export class RegisterDto extends PickType(CreateUserDto, [
  'name',
  'email',
  'phone',
  'password',
] as const) {}
