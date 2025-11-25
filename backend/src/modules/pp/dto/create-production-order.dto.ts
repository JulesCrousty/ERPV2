import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductionOrderDto {
  @IsInt()
  company_id: number;

  @IsInt()
  material_id: number;

  @IsNumber()
  planned_quantity: number;

  @IsString()
  uom: string;

  @IsOptional()
  @IsInt()
  bom_id?: number;

  @IsOptional()
  @IsInt()
  routing_id?: number;

  @IsOptional()
  @IsString()
  start_date_planned?: string;

  @IsOptional()
  @IsString()
  end_date_planned?: string;
}
