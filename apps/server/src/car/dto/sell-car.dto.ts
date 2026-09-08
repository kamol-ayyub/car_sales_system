import { IsNotEmpty, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class SellCarDto {
  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;
}
