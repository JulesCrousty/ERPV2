import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { AnalyticsDataSource } from '../entities/analytics-datasource.entity';
import { AnalyticsMetric, AnalyticsAggregationType } from '../entities/analytics-metric.entity';
import { AnalyticsDataset } from '../entities/analytics-dataset.entity';
import { AnalyticsQueryLog } from '../entities/analytics-query-log.entity';
import { QueryDataSourceDto } from '../dto/query-datasource.dto';

@Injectable()
export class AnalyticsQueryEngineService {
  private readonly logger = new Logger(AnalyticsQueryEngineService.name);

  constructor(
    @InjectRepository(AnalyticsDataSource)
    private readonly datasourcesRepository: Repository<AnalyticsDataSource>,
    @InjectRepository(AnalyticsQueryLog)
    private readonly queryLogRepository: Repository<AnalyticsQueryLog>,
    private readonly dataSource: DataSource,
  ) {}

  async runDatasourceQuery(dto: QueryDataSourceDto): Promise<any[]> {
    const datasource = await this.datasourcesRepository.findOne({ where: { code: dto.datasource_code }, relations: ['company'] });
    if (!datasource) {
      throw new NotFoundException('Datasource not found');
    }
    const qb = this.buildBaseQuery(datasource, dto);
    const start = Date.now();
    const result = await qb.getRawMany();
    await this.logQuery(datasource.code, dto.filters ?? {}, start);
    return result;
  }

  async runMetric(metric: AnalyticsMetric, filters?: Record<string, any>): Promise<number> {
    const datasource = await this.datasourcesRepository.findOne({ where: { id: metric.datasource.id }, relations: ['company'] });
    if (!datasource) {
      throw new NotFoundException('Datasource not found for metric');
    }
    const metadata = this.dataSource.getMetadata(datasource.entityName);
    const repository = this.dataSource.getRepository(metadata.target as any);
    const qb = repository.createQueryBuilder('src');
    const field = `${qb.alias}.${metric.field}`;
    qb.select(`${metric.aggregation}(${field})`, 'value');
    const combinedFilters = { ...(metric.filters ?? {}), ...(filters ?? {}) };
    this.applyFilters(qb, datasource, combinedFilters);
    this.applyCompanyFilter(qb, metadata, datasource.company?.id);
    const start = Date.now();
    const raw = await qb.getRawOne();
    await this.logQuery(datasource.code, combinedFilters, start);
    return raw?.value ?? 0;
  }

  async runDataset(dataset: AnalyticsDataset, filters?: Record<string, any>): Promise<any[]> {
    const datasources = await this.datasourcesRepository.find({
      where: dataset.datasources.map((d) => ({ code: d.code })),
      relations: ['company'],
    });
    if (datasources.length !== dataset.datasources.length) {
      throw new NotFoundException('One or more datasources not found for dataset');
    }
    const baseDefinition = dataset.datasources[0];
    const baseDatasource = datasources.find((d) => d.code === baseDefinition.code) as AnalyticsDataSource;
    const baseMetadata = this.dataSource.getMetadata(baseDatasource.entityName);
    const repository = this.dataSource.getRepository(baseMetadata.target as any);
    const qb = repository.createQueryBuilder('ds0');
    this.applyCompanyFilter(qb, baseMetadata, baseDatasource.company?.id);

    qb.select([]);
    dataset.fields.forEach((field) => {
      qb.addSelect(field.includes('.') ? field : `${qb.alias}.${field}`, field.replace('.', '_'));
    });

    dataset.datasources.slice(1).forEach((definition, index) => {
      const datasource = datasources.find((d) => d.code === definition.code);
      if (!datasource) {
        throw new NotFoundException(`Datasource ${definition.code} not found`);
      }
      const metadata = this.dataSource.getMetadata(datasource.entityName);
      const joinAlias = `ds${index + 1}`;
      const joinConditionField = definition.join ?? 'id';
      qb.innerJoin(
        metadata.tableName,
        joinAlias,
        `${joinAlias}.${joinConditionField} = ${qb.alias}.${joinConditionField}`,
      );
      this.applyCompanyFilter(qb, metadata, datasource.company?.id, joinAlias);
    });

    const combinedFilters = { ...(dataset.filters ?? {}), ...(filters ?? {}) };
    this.applyFilters(qb, baseDatasource, combinedFilters);

    const groupBy = (dataset.filters as any)?.group_by as string[] | undefined;
    if (groupBy?.length) {
      groupBy.forEach((g) => qb.addGroupBy(g.includes('.') ? g : `${qb.alias}.${g}`));
    }

    const orderBy = (dataset.filters as any)?.order_by as { field: string; direction: 'ASC' | 'DESC' }[] | undefined;
    if (orderBy?.length) {
      orderBy.forEach((o, idx) => {
        if (idx === 0) {
          qb.orderBy(o.field, o.direction);
        } else {
          qb.addOrderBy(o.field, o.direction);
        }
      });
    }

    const limit = (dataset.filters as any)?.limit as number | undefined;
    const offset = (dataset.filters as any)?.offset as number | undefined;
    if (typeof limit === 'number') {
      qb.limit(limit);
    }
    if (typeof offset === 'number') {
      qb.offset(offset);
    }

    const start = Date.now();
    const rows = await qb.getRawMany();
    await this.logQuery(baseDatasource.code, combinedFilters, start);
    return rows;
  }

  private buildBaseQuery(datasource: AnalyticsDataSource, dto: QueryDataSourceDto): SelectQueryBuilder<any> {
    const metadata = this.dataSource.getMetadata(datasource.entityName);
    const repository = this.dataSource.getRepository(metadata.target as any);
    const qb = repository.createQueryBuilder('src');
    const selectFields = dto.select?.length ? dto.select : datasource.allowedFields;
    qb.select([]);
    selectFields.forEach((field) => {
      if (!datasource.allowedFields.includes(field)) {
        throw new BadRequestException(`Field ${field} is not allowed`);
      }
      qb.addSelect(`${qb.alias}.${field}`, field.replace('.', '_'));
    });

    this.applyFilters(qb, datasource, dto.filters ?? {});
    this.applyCompanyFilter(qb, metadata, datasource.company?.id);

    if (dto.group_by?.length) {
      dto.group_by.forEach((group) => qb.addGroupBy(group.includes('.') ? group : `${qb.alias}.${group}`));
    }

    if (dto.order_by?.length) {
      dto.order_by.forEach((order, index) => {
        if (index === 0) {
          qb.orderBy(`${qb.alias}.${order.field}`, order.direction);
        } else {
          qb.addOrderBy(`${qb.alias}.${order.field}`, order.direction);
        }
      });
    }

    if (dto.limit !== undefined) {
      qb.limit(dto.limit);
    }
    if (dto.offset !== undefined) {
      qb.offset(dto.offset);
    }

    return qb;
  }

  private applyFilters(qb: SelectQueryBuilder<any>, datasource: AnalyticsDataSource, filters: Record<string, any>): void {
    Object.entries(filters).forEach(([field, value], index) => {
      if (!datasource.filterableFields.includes(field)) {
        throw new BadRequestException(`Field ${field} is not filterable`);
      }
      const parameterName = `filter_${index}`;
      qb.andWhere(`${qb.alias}.${field} = :${parameterName}`, { [parameterName]: value });
    });
  }

  private applyCompanyFilter(
    qb: SelectQueryBuilder<any>,
    metadata: any,
    companyId?: number,
    alias?: string,
  ): void {
    if (!companyId) {
      return;
    }
    const queryAlias = alias ?? qb.alias;
    const companyColumn = metadata.columns.find(
      (col: any) => col.propertyName === 'company_id' || col.databaseName === 'company_id' || col.propertyName === 'companyId',
    );
    if (companyColumn) {
      qb.andWhere(`${queryAlias}.${companyColumn.databaseName ?? companyColumn.propertyName} = :companyId`, { companyId });
    }
  }

  private async logQuery(datasourceCode: string, filters: Record<string, any>, startedAt: number): Promise<void> {
    const durationMs = Date.now() - startedAt;
    await this.queryLogRepository.save({ datasourceCode, filters, durationMs });
    this.logger.log(`Query on ${datasourceCode} executed in ${durationMs}ms`);
  }
}
