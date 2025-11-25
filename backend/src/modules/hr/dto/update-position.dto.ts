import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdatePositionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  department_id?: number;
}
