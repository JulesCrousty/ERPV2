import { IsNumber, IsOptional, IsPositive, IsString, ValidateIf } from 'class-validator';

export class FiDocumentLineDto {
  @IsNumber()
  account_id: number;

  @ValidateIf((o) => o.credit === undefined)
  @IsNumber()
  @IsPositive()
  debit?: number;

  @ValidateIf((o) => o.debit === undefined)
  @IsNumber()
  @IsPositive()
  credit?: number;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  cost_center?: string;

  @IsOptional()
  @IsString()
  profit_center?: string;

  @IsOptional()
  @IsNumber()
  customer_id?: number;

  @IsOptional()
  @IsNumber()
  vendor_id?: number;
}
