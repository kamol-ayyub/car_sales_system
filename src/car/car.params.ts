import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class FindOneCarParams {
  @IsUUID()
  @IsNotEmpty()
  @IsString()
  id: string;
}
