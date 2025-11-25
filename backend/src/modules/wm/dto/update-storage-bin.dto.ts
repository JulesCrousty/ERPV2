import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateStorageBinDto {
  @IsOptional()
  @IsInt()
  storage_type_id?: number;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsBoolean()
  is_blocked?: boolean;

  @IsOptional()
  @IsString()
  block_reason?: string;
}
