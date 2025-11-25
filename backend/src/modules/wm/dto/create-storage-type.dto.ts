import { IsEnum, IsInt, IsString } from 'class-validator';
import { PickingStrategy, PutawayStrategy } from '../entities/wm-storage-type.entity';

export class CreateStorageTypeDto {
  @IsInt()
  warehouse_id: number;

  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsEnum(PutawayStrategy)
  putaway_strategy: PutawayStrategy;

  @IsEnum(PickingStrategy)
  picking_strategy: PickingStrategy;
}
