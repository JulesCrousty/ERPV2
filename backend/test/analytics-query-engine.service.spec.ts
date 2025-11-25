import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AnalyticsQueryEngineService } from '../src/modules/analytics/services/analytics-query-engine.service';
import { AnalyticsDataSource } from '../src/modules/analytics/entities/analytics-datasource.entity';
import { AnalyticsQueryLog } from '../src/modules/analytics/entities/analytics-query-log.entity';
import { AnalyticsMetric, AnalyticsAggregationType } from '../src/modules/analytics/entities/analytics-metric.entity';
import { AnalyticsDataset } from '../src/modules/analytics/entities/analytics-dataset.entity';
import { QueryDataSourceDto } from '../src/modules/analytics/dto/query-datasource.dto';

const createRepositoryMock = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
});

const createQueryBuilderMock = () => {
  const qb: any = {
    alias: 'src',
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
  };
  return qb;
};

describe('AnalyticsQueryEngineService', () => {
  let service: AnalyticsQueryEngineService;
  const datasourcesRepository = createRepositoryMock();
  const queryLogRepository = createRepositoryMock();
  const baseQueryBuilder = createQueryBuilderMock();
  const joinQueryBuilder = createQueryBuilderMock();

  const baseMetadata: any = {
    target: {},
    tableName: 'base_table',
    columns: [
      { propertyName: 'company_id', databaseName: 'company_id' },
      { propertyName: 'amount', databaseName: 'amount' },
      { propertyName: 'category', databaseName: 'category' },
      { propertyName: 'material_id', databaseName: 'material_id' },
    ],
  };
  const joinMetadata: any = {
    target: {},
    tableName: 'join_table',
    columns: [
      { propertyName: 'company_id', databaseName: 'company_id' },
      { propertyName: 'material_id', databaseName: 'material_id' },
    ],
  };

  const dataSource: Partial<DataSource> = {
    getMetadata: jest.fn().mockImplementation((name: string) => {
      if (name === 'BaseEntity') return baseMetadata;
      if (name === 'JoinEntity') return joinMetadata;
      throw new NotFoundException();
    }),
    getRepository: jest.fn().mockImplementation((target: any) => {
      if (target === baseMetadata.target) {
        return { createQueryBuilder: () => baseQueryBuilder } as any;
      }
      return { createQueryBuilder: () => joinQueryBuilder } as any;
    }),
  };

  const baseDatasource: AnalyticsDataSource = {
    id: 1,
    company: { id: 10 } as any,
    code: 'BASE',
    name: 'Base',
    description: '',
    entityName: 'BaseEntity',
    allowedFields: ['amount', 'category', 'material_id'],
    filterableFields: ['amount', 'category', 'material_id'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const joinDatasource: AnalyticsDataSource = {
    id: 2,
    company: { id: 10 } as any,
    code: 'JOIN',
    name: 'Join',
    description: '',
    entityName: 'JoinEntity',
    allowedFields: ['material_id'],
    filterableFields: ['material_id'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    baseQueryBuilder.andWhere.mockClear();
    datasourcesRepository.findOne = jest.fn().mockResolvedValue(baseDatasource);
    datasourcesRepository.find = jest.fn().mockResolvedValue([baseDatasource, joinDatasource]);
    queryLogRepository.save = jest.fn().mockResolvedValue({});
    baseQueryBuilder.getRawMany.mockResolvedValue([{ amount: 100 }]);
    baseQueryBuilder.getRawOne.mockResolvedValue({ value: 30 });
    joinQueryBuilder.getRawMany.mockResolvedValue([]);

    service = new AnalyticsQueryEngineService(
      datasourcesRepository as any,
      queryLogRepository as any,
      dataSource as DataSource,
    );
  });

  it('should run SUM metric', async () => {
    const metric: AnalyticsMetric = {
      id: 1,
      company: baseDatasource.company,
      code: 'SUM_TEST',
      name: 'Sum',
      datasource: baseDatasource,
      aggregation: AnalyticsAggregationType.SUM,
      field: 'amount',
      filters: { category: 'A' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await service.runMetric(metric, { category: 'A' });

    expect(baseQueryBuilder.select).toHaveBeenCalledWith(`SUM(${baseQueryBuilder.alias}.amount)`, 'value');
    expect(result).toBe(30);
    expect(queryLogRepository.save).toHaveBeenCalled();
  });

  it('should run dataset with multiple sources', async () => {
    const dataset: AnalyticsDataset = {
      id: 1,
      company: baseDatasource.company,
      code: 'DS',
      name: 'Dataset',
      datasources: [
        { code: 'BASE', join: 'material_id' },
        { code: 'JOIN', join: 'material_id' },
      ],
      fields: ['amount', 'category'],
      filters: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    baseQueryBuilder.getRawMany.mockResolvedValue([{ amount: 10, category: 'X' }]);

    const rows = await service.runDataset(dataset, { category: 'X' });

    expect(baseQueryBuilder.innerJoin).toHaveBeenCalledWith(
      joinMetadata.tableName,
      'ds1',
      `ds1.material_id = ${baseQueryBuilder.alias}.material_id`,
    );
    expect(rows).toEqual([{ amount: 10, category: 'X' }]);
  });

  it('should enforce company filtering', async () => {
    await service.runDatasourceQuery({ datasource_code: 'BASE', filters: {} } as QueryDataSourceDto);
    const companyFilter = baseQueryBuilder.andWhere.mock.calls.find((call: any[]) =>
      (call?.[0] as string).includes('company'),
    );
    expect(companyFilter).toBeTruthy();
  });

  it('should apply group by when provided', async () => {
    baseQueryBuilder.getRawMany.mockResolvedValue([{ category: 'A', amount: 50 }]);
    await service.runDatasourceQuery({ datasource_code: 'BASE', filters: {}, group_by: ['category'] } as QueryDataSourceDto);
    expect(baseQueryBuilder.addGroupBy).toHaveBeenCalled();
  });

  it('should throw when filtering on non-filterable field', async () => {
    await expect(
      service.runDatasourceQuery({ datasource_code: 'BASE', filters: { invalid: 1 } } as QueryDataSourceDto),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
