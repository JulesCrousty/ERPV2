import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateOvertimeRuleDto {
  @IsInt()
  company_id: number;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(1)
  rate: number;

  @IsInt()
  @Min(0)
  min_minutes: number;

  @IsOptional()
  @IsInt()
  max_minutes?: number;
}
