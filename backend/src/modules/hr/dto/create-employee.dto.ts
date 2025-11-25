import { IsBoolean, IsDateString, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEmployeeDto {
  @IsInt()
  company_id: number;

  @IsOptional()
  @IsInt()
  user_id?: number;

  @IsString()
  @IsNotEmpty()
  employee_number: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsDateString()
  hire_date: string;

  @IsOptional()
  @IsDateString()
  termination_date?: string;

  @IsOptional()
  @IsInt()
  position_id?: number;

  @IsOptional()
  @IsInt()
  department_id?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
