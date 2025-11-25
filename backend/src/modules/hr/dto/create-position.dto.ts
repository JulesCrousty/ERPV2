import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePositionDto {
  @IsInt()
  company_id: number;

  @IsInt()
  department_id: number;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
