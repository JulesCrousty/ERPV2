import { IsInt, IsNumber, IsString } from 'class-validator';

export class PostFinishedGoodsReceiptDto {
  @IsInt()
  production_order_id: number;

  @IsInt()
  company_id: number;

  @IsInt()
  material_id: number;

  @IsString()
  storage_location_code: string;

  @IsNumber()
  quantity: number;

  @IsString()
  uom: string;

  @IsString()
  posting_date: string;
}
