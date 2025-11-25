import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../core/entities/company.entity';
import { AnalyticsMetric } from '../entities/analytics-metric.entity';
import { AnalyticsDataSource } from '../entities/analytics-datasource.entity';
import { CreateMetricDto } from '../dto/create-metric.dto';
import { RunMetricDto } from '../dto/run-metric.dto';
import { AnalyticsQueryEngineService } from './analytics-query-engine.service';

@Injectable()
export class AnalyticsMetricsService {
  private readonly logger = new Logger(AnalyticsMetricsService.name);

  constructor(
    @InjectRepository(AnalyticsMetric)
    private readonly metricsRepository: Repository<AnalyticsMetric>,
    @InjectRepository(AnalyticsDataSource)
    private readonly datasourcesRepository: Repository<AnalyticsDataSource>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    private readonly queryEngine: AnalyticsQueryEngineService,
  ) {}

  async create(dto: CreateMetricDto): Promise<AnalyticsMetric> {
    this.logger.log(`Creating analytics metric ${dto.code}`);
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const datasource = await this.datasourcesRepository.findOne({ where: { id: dto.datasource_id } });
    if (!datasource) {
      throw new NotFoundException('Datasource not found');
    }
    const metric = this.metricsRepository.create({
      company,
      code: dto.code,
      name: dto.name,
      datasource,
      aggregation: dto.aggregation,
      field: dto.field,
      filters: dto.filters,
    });
    return this.metricsRepository.save(metric);
  }

  async run(dto: RunMetricDto): Promise<number> {
    const metric = await this.metricsRepository.findOne({ where: { code: dto.metric_code }, relations: ['datasource', 'company'] });
    if (!metric) {
      throw new NotFoundException('Metric not found');
    }
    return this.queryEngine.runMetric(metric, dto.filters);
  }
}
