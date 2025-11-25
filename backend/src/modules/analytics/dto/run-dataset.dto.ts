import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RunDatasetDto {
  @IsString()
  @IsNotEmpty()
  dataset_code: string;

  @IsOptional()
  filters?: Record<string, any>;
}
