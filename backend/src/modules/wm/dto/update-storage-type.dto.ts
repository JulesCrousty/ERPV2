import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PickingStrategy, PutawayStrategy } from '../entities/wm-storage-type.entity';

export class UpdateStorageTypeDto {
  @IsOptional()
  @IsInt()
  warehouse_id?: number;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(PutawayStrategy)
  putaway_strategy?: PutawayStrategy;

  @IsOptional()
  @IsEnum(PickingStrategy)
  picking_strategy?: PickingStrategy;
}
