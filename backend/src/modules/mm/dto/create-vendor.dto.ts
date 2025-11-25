import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateVendorDto {
  @IsInt()
  company_id: number;

  @IsString()
  vendor_code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  payment_terms?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
