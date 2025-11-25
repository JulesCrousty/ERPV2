import { IsDateString, IsInt, Min } from 'class-validator';

export class CreateOvertimeEntryDto {
  @IsInt()
  employee_id: number;

  @IsInt()
  rule_id: number;

  @IsDateString()
  date: string;

  @IsInt()
  @Min(1)
  minutes: number;
}
