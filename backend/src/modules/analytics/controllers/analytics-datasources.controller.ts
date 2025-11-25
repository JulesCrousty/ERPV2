import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AnalyticsDatasourcesService } from '../services/analytics-datasources.service';
import { CreateDataSourceDto } from '../dto/create-datasource.dto';
import { QueryDataSourceDto } from '../dto/query-datasource.dto';

@Controller('analytics/datasources')
export class AnalyticsDatasourcesController {
  constructor(private readonly datasourcesService: AnalyticsDatasourcesService) {}

  @Post('create')
  create(@Body() dto: CreateDataSourceDto) {
    return this.datasourcesService.create(dto);
  }

  @Get()
  findAll() {
    return this.datasourcesService.findAll();
  }

  @Post(':code/query')
  query(@Param('code') code: string, @Body() dto: QueryDataSourceDto) {
    return this.datasourcesService.query({ ...dto, datasource_code: code });
  }
}
