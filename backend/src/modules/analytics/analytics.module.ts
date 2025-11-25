import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsDatasourcesController } from './controllers/analytics-datasources.controller';
import { AnalyticsMetricsController } from './controllers/analytics-metrics.controller';
import { AnalyticsDatasetsController } from './controllers/analytics-datasets.controller';
import { AnalyticsDashboardsController } from './controllers/analytics-dashboards.controller';
import { AnalyticsDataSource } from './entities/analytics-datasource.entity';
import { AnalyticsMetric } from './entities/analytics-metric.entity';
import { AnalyticsDataset } from './entities/analytics-dataset.entity';
import { AnalyticsDashboard } from './entities/analytics-dashboard.entity';
import { AnalyticsWidget } from './entities/analytics-widget.entity';
import { AnalyticsQueryLog } from './entities/analytics-query-log.entity';
import { AnalyticsDatasourcesService } from './services/analytics-datasources.service';
import { AnalyticsMetricsService } from './services/analytics-metrics.service';
import { AnalyticsDatasetsService } from './services/analytics-datasets.service';
import { AnalyticsDashboardsService } from './services/analytics-dashboards.service';
import { AnalyticsQueryEngineService } from './services/analytics-query-engine.service';
import { Company } from '../core/entities/company.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalyticsDataSource,
      AnalyticsMetric,
      AnalyticsDataset,
      AnalyticsDashboard,
      AnalyticsWidget,
      AnalyticsQueryLog,
      Company,
      User,
    ]),
  ],
  controllers: [
    AnalyticsDatasourcesController,
    AnalyticsMetricsController,
    AnalyticsDatasetsController,
    AnalyticsDashboardsController,
  ],
  providers: [
    AnalyticsDatasourcesService,
    AnalyticsMetricsService,
    AnalyticsDatasetsService,
    AnalyticsDashboardsService,
    AnalyticsQueryEngineService,
  ],
})
export class AnalyticsModule {}
