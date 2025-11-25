import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { WarehouseTaskType } from '../entities/wm-warehouse-task.entity';

export class CreateTransportOrderTaskDto {
  @IsEnum(WarehouseTaskType)
  task_type: WarehouseTaskType;

  @IsInt()
  material_id: number;

  @IsNumber()
  quantity: number;

  @IsString()
  uom: string;

  @IsOptional()
  @IsInt()
  source_bin_id?: number;

  @IsOptional()
  @IsInt()
  destination_bin_id?: number;
}

export class CreateTransportOrderDto {
  @IsInt()
  company_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransportOrderTaskDto)
  tasks: CreateTransportOrderTaskDto[];
}
