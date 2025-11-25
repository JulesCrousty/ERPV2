import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { HrAbsenceType } from '../entities/hr-absence.entity';

export class CreateAbsenceDto {
  @IsInt()
  employee_id: number;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsEnum(HrAbsenceType)
  type: HrAbsenceType;

  @IsOptional()
  @IsString()
  comment?: string;
}
