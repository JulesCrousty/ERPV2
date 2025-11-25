import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { HrAbsenceStatus } from '../entities/hr-absence.entity';

export class UpdateAbsenceStatusDto {
  @IsInt()
  validated_by: number;

  @IsEnum(HrAbsenceStatus)
  status: HrAbsenceStatus;

  @IsOptional()
  @IsString()
  comment?: string;
}
