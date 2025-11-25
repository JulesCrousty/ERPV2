import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SalesOrderItemDto {
  @IsInt()
  material_id: number;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0.0000000001)
  quantity: number;

  @IsString()
  uom: string;

  @IsNumber()
  @Min(0)
  unit_price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_percent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tax_percent?: number;
}
