import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { RoutingOperationDto } from './routing-operation.dto';

export class CreateRoutingDto {
  @IsInt()
  company_id: number;

  @IsInt()
  material_id: number;

  @IsString()
  routing_code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutingOperationDto)
  operations: RoutingOperationDto[];
}
