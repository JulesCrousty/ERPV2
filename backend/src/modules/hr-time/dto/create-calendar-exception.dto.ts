import { IsDateString, IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { HrCalendarExceptionType } from '../entities/hr-calendar-exception.entity';

export class CreateCalendarExceptionDto {
  @IsInt()
  calendar_id: number;

  @IsDateString()
  date: string;

  @IsEnum(HrCalendarExceptionType)
  type: HrCalendarExceptionType;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
