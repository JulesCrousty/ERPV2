import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDataSourceDto {
  @IsInt()
  company_id: number;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  entity_name: string;

  @IsArray()
  allowed_fields: string[];

  @IsArray()
  filterable_fields: string[];
}
