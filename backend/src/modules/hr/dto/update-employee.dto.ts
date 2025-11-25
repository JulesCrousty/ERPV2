import { IsBoolean, IsDateString, IsEmail, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  hire_date?: string;

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
