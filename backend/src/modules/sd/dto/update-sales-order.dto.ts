import { IsDateString, IsIn, IsOptional } from 'class-validator';
import { SalesOrderStatus } from '../entities/sd-sales-order.entity';

export class UpdateSalesOrderDto {
  @IsOptional()
  @IsDateString()
  requested_delivery_date?: string;

  @IsOptional()
  @IsIn([SalesOrderStatus.CONFIRMED, SalesOrderStatus.CANCELLED])
  status?: SalesOrderStatus;
}
