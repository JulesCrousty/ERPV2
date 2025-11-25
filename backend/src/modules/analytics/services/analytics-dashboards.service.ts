import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../core/entities/company.entity';
import { CreateDashboardDto } from '../dto/create-dashboard.dto';
import { AnalyticsDashboard } from '../entities/analytics-dashboard.entity';
import { AnalyticsWidget, AnalyticsWidgetType } from '../entities/analytics-widget.entity';
import { AnalyticsMetricsService } from './analytics-metrics.service';
import { AnalyticsDatasetsService } from './analytics-datasets.service';
import { RunDatasetDto } from '../dto/run-dataset.dto';
import { RunMetricDto } from '../dto/run-metric.dto';

@Injectable()
export class AnalyticsDashboardsService {
  private readonly logger = new Logger(AnalyticsDashboardsService.name);

  constructor(
    @InjectRepository(AnalyticsDashboard)
    private readonly dashboardsRepository: Repository<AnalyticsDashboard>,
    @InjectRepository(AnalyticsWidget)
    private readonly widgetsRepository: Repository<AnalyticsWidget>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    private readonly metricsService: AnalyticsMetricsService,
    private readonly datasetsService: AnalyticsDatasetsService,
  ) {}

  async create(dto: CreateDashboardDto): Promise<AnalyticsDashboard> {
    this.logger.log(`Creating analytics dashboard ${dto.code}`);
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const dashboard = this.dashboardsRepository.create({
      company,
      code: dto.code,
      name: dto.name,
      layout: dto.layout,
    });
    const savedDashboard = await this.dashboardsRepository.save(dashboard);
    const widgets = dto.widgets?.map((widget) =>
      this.widgetsRepository.create({
        dashboard: savedDashboard,
        type: widget.type as AnalyticsWidgetType,
        datasetCode: widget.dataset_code,
        metricCode: widget.metric_code,
        config: widget.config,
        position: widget.position,
      }),
    );
    if (widgets?.length) {
      await this.widgetsRepository.save(widgets);
    }
    return savedDashboard;
  }

  async getByCode(code: string): Promise<AnalyticsDashboard> {
    const dashboard = await this.dashboardsRepository.findOne({ where: { code }, relations: ['company'] });
    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }
    return dashboard;
  }

  async run(code: string): Promise<{ layout: any; widgets: Record<string, any> }> {
    const dashboard = await this.getByCode(code);
    const widgets = await this.widgetsRepository.find({ where: { dashboard: { id: dashboard.id } } });
    const results: Record<string, any> = {};
    for (const widget of widgets) {
      if (widget.metricCode) {
        const value = await this.metricsService.run({ metric_code: widget.metricCode } as RunMetricDto);
        results[widget.id] = { type: widget.type, value };
      } else {
        const data = await this.datasetsService.run({ dataset_code: widget.datasetCode } as RunDatasetDto);
        results[widget.id] = { type: widget.type, data };
      }
    }
    return { layout: dashboard.layout, widgets: results };
  }
}
