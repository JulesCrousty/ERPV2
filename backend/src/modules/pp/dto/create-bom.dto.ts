import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { BomItemDto } from './bom-item.dto';

export class CreateBomDto {
  @IsInt()
  company_id: number;

  @IsInt()
  material_id: number;

  @IsString()
  bom_code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BomItemDto)
  items: BomItemDto[];
}
