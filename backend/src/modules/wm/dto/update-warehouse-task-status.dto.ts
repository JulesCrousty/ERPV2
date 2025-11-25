import { IsEnum } from 'class-validator';
import { WarehouseTaskStatus } from '../entities/wm-warehouse-task.entity';

export class UpdateWarehouseTaskStatusDto {
  @IsEnum(WarehouseTaskStatus)
  status: WarehouseTaskStatus.IN_PROGRESS | WarehouseTaskStatus.DONE | WarehouseTaskStatus.CANCELLED;
}
