import { Body, Controller, Post } from '@nestjs/common';
import { AnalyticsMetricsService } from '../services/analytics-metrics.service';
import { CreateMetricDto } from '../dto/create-metric.dto';
import { RunMetricDto } from '../dto/run-metric.dto';

@Controller('analytics/metrics')
export class AnalyticsMetricsController {
  constructor(private readonly metricsService: AnalyticsMetricsService) {}

  @Post('create')
  create(@Body() dto: CreateMetricDto) {
    return this.metricsService.create(dto);
  }

  @Post('run')
  run(@Body() dto: RunMetricDto) {
    return this.metricsService.run(dto);
  }
}
