import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { WarehouseTaskType } from '../entities/wm-warehouse-task.entity';

export class CreateWarehouseTaskDto {
  @IsInt()
  transport_order_id: number;

  @IsEnum(WarehouseTaskType)
  task_type: WarehouseTaskType;

  @IsOptional()
  @IsInt()
  source_bin_id?: number;

  @IsOptional()
  @IsInt()
  destination_bin_id?: number;

  @IsInt()
  material_id: number;

  @IsNumber()
  quantity: number;

  @IsString()
  uom: string;

  @IsOptional()
  @IsInt()
  sequence?: number;
}
