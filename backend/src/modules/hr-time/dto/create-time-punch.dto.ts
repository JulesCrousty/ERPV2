import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { HrTimePunchSource, HrTimePunchType } from '../entities/hr-time-punch.entity';

export class CreateTimePunchDto {
  @IsInt()
  employee_id: number;

  @IsEnum(HrTimePunchType)
  punch_type: HrTimePunchType;

  @IsDateString()
  timestamp: string;

  @IsOptional()
  @IsEnum(HrTimePunchSource)
  source?: HrTimePunchSource;

  @IsOptional()
  @IsInt()
  created_by?: number;
}
