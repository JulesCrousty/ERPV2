import { IsInt, IsNumber, IsString } from 'class-validator';

export class CreateBinMovementDto {
  @IsInt()
  material_id: number;

  @IsInt()
  company_id: number;

  @IsNumber()
  quantity: number;

  @IsString()
  uom: string;

  @IsInt()
  source_bin_id: number;

  @IsInt()
  destination_bin_id: number;
}
