import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class FindOneParams {
  @IsUUID()
  @IsNotEmpty()
  @IsString()
  id: string;
}
