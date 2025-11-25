import { IsEnum } from 'class-validator';
import { TransportOrderStatus } from '../entities/wm-transport-order.entity';

export class UpdateTransportOrderStatusDto {
  @IsEnum(TransportOrderStatus)
  status: TransportOrderStatus.RELEASED | TransportOrderStatus.CANCELLED;
}
