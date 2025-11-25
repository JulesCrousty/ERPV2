import { IsOptional, IsString } from 'class-validator';

export class ReverseGoodsReceiptDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
