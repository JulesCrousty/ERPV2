import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class WorkScheduleDayInput {
  @IsInt()
  @Min(0)
  @Max(6)
  weekday: number;

  @IsString()
  start_time: string;

  @IsString()
  end_time: string;

  @IsInt()
  @Min(0)
  break_minutes: number;
}

export class CreateWorkScheduleDto {
  @IsInt()
  company_id: number;

  @IsOptional()
  @IsInt()
  employee_id?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  weekly_hours: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkScheduleDayInput)
  days: WorkScheduleDayInput[];
}
