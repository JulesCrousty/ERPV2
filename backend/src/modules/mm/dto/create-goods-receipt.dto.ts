import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GoodsReceiptItemDto {
  @IsInt()
  material_id: number;

  @IsNumber()
  quantity: number;

  @IsString()
  uom: string;

  @IsString()
  storage_location_code: string;

  @IsNumber()
  unit_price: number;

  @IsOptional()
  @IsInt()
  po_item_id?: number;
}

export class CreateGoodsReceiptDto {
  @IsInt()
  company_id: number;

  @IsDateString()
  posting_date: string;

  @IsOptional()
  @IsInt()
  vendor_id?: number;

  @IsOptional()
  @IsInt()
  purchase_order_id?: number;

  @IsString()
  currency: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GoodsReceiptItemDto)
  items: GoodsReceiptItemDto[];
}
