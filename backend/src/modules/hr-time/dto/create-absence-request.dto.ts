import { IsDateString, IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { HrAbsenceType } from '../entities/hr-absence-request.entity';

export class CreateAbsenceRequestDto {
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
  @MaxLength(255)
  comment?: string;
}
