import { IsArray, IsNumber } from 'class-validator';

export class GeneratePayrollDto {
  @IsNumber()
  period_id: number;

  @IsArray()
  employee_ids: number[];
}
