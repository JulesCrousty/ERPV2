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

export class PurchaseRequisitionItemDto {
  @IsInt()
  material_id: number;

  @IsNumber()
  quantity: number;

  @IsString()
  uom: string;

  @IsOptional()
  @IsDateString()
  desired_delivery_date?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreatePurchaseRequisitionDto {
  @IsInt()
  company_id: number;

  @IsDateString()
  requested_date: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PurchaseRequisitionItemDto)
  items: PurchaseRequisitionItemDto[];
}
