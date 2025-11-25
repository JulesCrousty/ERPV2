import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateWarehouseDto {
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
  @IsBoolean()
  is_active?: boolean;
}
