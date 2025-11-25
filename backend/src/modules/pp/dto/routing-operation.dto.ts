import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class RoutingOperationDto {
  @IsInt()
  operation_number: number;

  @IsInt()
  work_center_id: number;

  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  setup_time_hours?: number;

  @IsOptional()
  @IsNumber()
  processing_time_hours?: number;

  @IsOptional()
  @IsNumber()
  move_time_hours?: number;

  @IsOptional()
  @IsNumber()
  queue_time_hours?: number;

  @IsOptional()
  @IsInt()
  sequence?: number;
}
