import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { FiAccountType } from '../entities/fi-account.entity';

export class CreateFiAccountDto {
  @IsNumber()
  company_id: number;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(FiAccountType)
  type: FiAccountType;

  @IsOptional()
  @IsBoolean()
  is_recon_account?: boolean;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
