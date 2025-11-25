import { IsBoolean, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateWorkCenterDto {
  @IsInt()
  company_id: number;

  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  capacity_per_hour?: number;

  @IsOptional()
  @IsNumber()
  cost_per_hour?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
