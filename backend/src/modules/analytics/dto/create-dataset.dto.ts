import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDatasetDto {
  @IsInt()
  company_id: number;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  datasources: Array<{ code: string; join?: string }>;

  @IsArray()
  fields: string[];

  @IsOptional()
  filters?: Record<string, any>;
}
