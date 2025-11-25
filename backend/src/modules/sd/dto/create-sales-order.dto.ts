import { ArrayMinSize, IsArray, IsDateString, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SalesOrderItemDto } from './sales-order-item.dto';

export class CreateSalesOrderDto {
  @IsInt()
  company_id: number;

  @IsInt()
  customer_id: number;

  @IsDateString()
  order_date: string;

  @IsOptional()
  @IsDateString()
  requested_delivery_date?: string;

  @IsString()
  currency: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SalesOrderItemDto)
  items: SalesOrderItemDto[];
}
