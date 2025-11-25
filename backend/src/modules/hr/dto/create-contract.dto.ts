import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { HrContractType } from '../entities/hr-contract.entity';

export class CreateContractDto {
  @IsInt()
  employee_id: number;

  @IsDateString()
  start_date: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsEnum(HrContractType)
  contract_type: HrContractType;

  @IsNumber()
  base_salary: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsNumber()
  weekly_hours: number;
}
