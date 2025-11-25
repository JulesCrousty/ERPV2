import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AnalyticsDashboardsService } from '../services/analytics-dashboards.service';
import { CreateDashboardDto } from '../dto/create-dashboard.dto';

@Controller('analytics/dashboards')
export class AnalyticsDashboardsController {
  constructor(private readonly dashboardsService: AnalyticsDashboardsService) {}

  @Post('create')
  create(@Body() dto: CreateDashboardDto) {
    return this.dashboardsService.create(dto);
  }

  @Get(':code')
  get(@Param('code') code: string) {
    return this.dashboardsService.getByCode(code);
  }

  @Post(':code/run')
  run(@Param('code') code: string) {
    return this.dashboardsService.run(code);
  }
}
