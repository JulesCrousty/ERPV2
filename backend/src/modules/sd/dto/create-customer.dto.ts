import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsInt()
  company_id: number;

  @IsString()
  customer_code: string;

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
  postal_code?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  payment_terms?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
