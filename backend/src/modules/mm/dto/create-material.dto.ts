import { IsBoolean, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { MaterialType } from '../entities/mm-material.entity';

export class CreateMaterialDto {
  @IsInt()
  company_id: number;

  @IsString()
  material_code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(MaterialType)
  material_type: MaterialType;

  @IsString()
  base_uom: string;

  @IsOptional()
  @IsString()
  purchasing_group?: string;

  @IsOptional()
  @IsString()
  valuation_class?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
