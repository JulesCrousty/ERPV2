import { IsBoolean, IsInt, IsNumber, IsOptional } from 'class-validator';

export class ConfirmOperationDto {
  @IsInt()
  operation_id: number;

  @IsNumber()
  actual_time_hours: number;

  @IsNumber()
  quantity_confirmed: number;

  @IsOptional()
  @IsBoolean()
  is_last_operation?: boolean;
}
