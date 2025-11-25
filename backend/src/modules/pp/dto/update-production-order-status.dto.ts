import { IsIn } from 'class-validator';
import { ProductionOrderStatus } from '../entities/pp-production-order.entity';

export class UpdateProductionOrderStatusDto {
  @IsIn(['RELEASED', 'CANCELLED'])
  status: Extract<ProductionOrderStatus, 'RELEASED' | 'CANCELLED'>;
}
