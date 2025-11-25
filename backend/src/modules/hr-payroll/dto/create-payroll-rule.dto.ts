import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { HrPayrollRuleCalculationType, HrPayrollRuleCategory } from '../entities/hr-payroll-rule.entity';

export class CreatePayrollRuleDto {
  @IsNumber()
  company_id: number;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(HrPayrollRuleCategory)
  category: HrPayrollRuleCategory;

  @IsEnum(HrPayrollRuleCalculationType)
  calculation_type: HrPayrollRuleCalculationType;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsNumber()
  rate?: number;

  @IsOptional()
  @IsString()
  formula?: string;

  @IsNumber()
  priority: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
