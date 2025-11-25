import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderByDto {
  @IsString()
  field: string;

  @IsString()
  direction: 'ASC' | 'DESC';
}

export class QueryDataSourceDto {
  @IsString()
  @IsNotEmpty()
  datasource_code: string;

  @IsOptional()
  filters?: Record<string, any>;

  @IsOptional()
  @IsArray()
  select?: string[];

  @IsOptional()
  @IsArray()
  group_by?: string[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OrderByDto)
  order_by?: OrderByDto[];

  @IsOptional()
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsInt()
  offset?: number;
}
