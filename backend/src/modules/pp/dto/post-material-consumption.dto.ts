import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNumber, IsString, ValidateNested } from 'class-validator';

class MaterialConsumptionItemDto {
  @IsInt()
  material_id: number;

  @IsString()
  storage_location_code: string;

  @IsNumber()
  quantity: number;

  @IsString()
  uom: string;
}

export class PostMaterialConsumptionDto {
  @IsInt()
  production_order_id: number;

  @IsInt()
  company_id: number;

  @IsString()
  posting_date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialConsumptionItemDto)
  items: MaterialConsumptionItemDto[];
}
