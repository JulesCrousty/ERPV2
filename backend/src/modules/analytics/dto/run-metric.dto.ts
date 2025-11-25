import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RunMetricDto {
  @IsString()
  @IsNotEmpty()
  metric_code: string;

  @IsOptional()
  filters?: Record<string, any>;
}
