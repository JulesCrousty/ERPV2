import { IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { HrAbsenceStatus } from '../entities/hr-absence-request.entity';

export class UpdateAbsenceRequestStatusDto {
  @IsEnum(HrAbsenceStatus)
  status: HrAbsenceStatus;

  @IsInt()
  validated_by: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  comment?: string;
}
