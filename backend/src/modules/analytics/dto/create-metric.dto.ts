import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AnalyticsAggregationType } from '../entities/analytics-metric.entity';

export class CreateMetricDto {
  @IsInt()
  company_id: number;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  datasource_id: number;

  @IsEnum(AnalyticsAggregationType)
  aggregation: AnalyticsAggregationType;

  @IsString()
  @IsNotEmpty()
  field: string;

  @IsOptional()
  filters?: Record<string, any>;
}
