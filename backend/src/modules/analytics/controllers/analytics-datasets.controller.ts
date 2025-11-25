import { Body, Controller, Post } from '@nestjs/common';
import { AnalyticsDatasetsService } from '../services/analytics-datasets.service';
import { CreateDatasetDto } from '../dto/create-dataset.dto';
import { RunDatasetDto } from '../dto/run-dataset.dto';

@Controller('analytics/datasets')
export class AnalyticsDatasetsController {
  constructor(private readonly datasetsService: AnalyticsDatasetsService) {}

  @Post('create')
  create(@Body() dto: CreateDatasetDto) {
    return this.datasetsService.create(dto);
  }

  @Post('run')
  run(@Body() dto: RunDatasetDto) {
    return this.datasetsService.run(dto);
  }
}
