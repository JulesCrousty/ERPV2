import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class BomItemDto {
  @IsInt()
  component_material_id: number;

  @IsNumber()
  quantity: number;

  @IsString()
  uom: string;

  @IsOptional()
  @IsNumber()
  scrap_percent?: number;
}
