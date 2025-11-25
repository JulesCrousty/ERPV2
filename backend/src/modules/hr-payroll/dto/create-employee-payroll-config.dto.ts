import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateEmployeePayrollConfigDto {
  @IsNumber()
  employee_id: number;

  @IsNumber()
  base_salary: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsNumber()
  weekly_hours: number;

  @IsBoolean()
  is_taxable: boolean;
}
