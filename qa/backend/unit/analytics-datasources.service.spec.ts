import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AnalyticsDatasourcesService } from '../../../backend/src/modules/analytics/services/analytics-datasources.service';
import { AnalyticsDataSource } from '../../../backend/src/modules/analytics/entities/analytics-datasource.entity';
import { Company } from '../../../backend/src/modules/core/entities/company.entity';
import { AnalyticsQueryEngineService } from '../../../backend/src/modules/analytics/services/analytics-query-engine.service';
import { CreateDataSourceDto } from '../../../backend/src/modules/analytics/dto/create-datasource.dto';
import { QueryDataSourceDto } from '../../../backend/src/modules/analytics/dto/query-datasource.dto';

describe('AnalyticsDatasourcesService (QA)', () => {
  let service: AnalyticsDatasourcesService;
  let datasourcesRepository: Partial<Repository<AnalyticsDataSource>>;
  let companiesRepository: Partial<Repository<Company>>;
  let dataSource: Partial<DataSource>;
  let queryEngine: Partial<AnalyticsQueryEngineService>;

  beforeEach(() => {
    datasourcesRepository = { create: jest.fn(), save: jest.fn(), findOne: jest.fn() } as Partial<Repository<AnalyticsDataSource>>;
    companiesRepository = { findOne: jest.fn() } as Partial<Repository<Company>>;
    dataSource = { getMetadata: jest.fn() } as Partial<DataSource>;
    queryEngine = { runDatasourceQuery: jest.fn() } as Partial<AnalyticsQueryEngineService>;

    service = new AnalyticsDatasourcesService(
      datasourcesRepository as Repository<AnalyticsDataSource>,
      companiesRepository as Repository<Company>,
      dataSource as DataSource,
      queryEngine as AnalyticsQueryEngineService,
    );
  });

  it('should validate allowed and filterable fields against metadata', async () => {
    (companiesRepository.findOne as jest.Mock).mockResolvedValue({ id: 1 } as Company);
    (dataSource.getMetadata as jest.Mock).mockReturnValue({
      columns: [
        { propertyName: 'id' },
        { propertyName: 'name' },
        { propertyName: 'status' },
      ],
    });
    (datasourcesRepository.create as jest.Mock).mockReturnValue({ code: 'TEST' });
    (datasourcesRepository.save as jest.Mock).mockImplementation(async (value) => value);

    const dto: CreateDataSourceDto = {
      company_id: 1,
      code: 'TEST',
      name: 'QA Source',
      description: 'Functional data source',
      entity_name: 'TestEntity',
      allowed_fields: ['id', 'name'],
      filterable_fields: ['status'],
    };

    const created = await service.create(dto);
    expect(created).toHaveProperty('code', 'TEST');
    expect(datasourcesRepository.save).toHaveBeenCalled();
  });

  it('should reject unknown allowed fields', async () => {
    (companiesRepository.findOne as jest.Mock).mockResolvedValue({ id: 1 } as Company);
    (dataSource.getMetadata as jest.Mock).mockReturnValue({ columns: [{ propertyName: 'id' }] });

    const dto: CreateDataSourceDto = {
      company_id: 1,
      code: 'INVALID',
      name: 'Invalid',
      description: 'Invalid',
      entity_name: 'X',
      allowed_fields: ['missing'],
      filterable_fields: [],
    };

    await expect(service.create(dto)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should throw NotFoundException when company is missing', async () => {
    (companiesRepository.findOne as jest.Mock).mockResolvedValue(null);
    (dataSource.getMetadata as jest.Mock).mockReturnValue({ columns: [] });

    const dto: CreateDataSourceDto = {
      company_id: 999,
      code: 'MISSING',
      name: 'Missing',
      description: 'Missing',
      entity_name: 'X',
      allowed_fields: [],
      filterable_fields: [],
    };

    await expect(service.create(dto)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should delegate query execution to query engine', async () => {
    (queryEngine.runDatasourceQuery as jest.Mock).mockResolvedValue([{ id: 1 }]);
    const dto = { datasource_id: 1, fields: ['id'], filters: [] } as QueryDataSourceDto;

    const result = await service.query(dto);
    expect(result).toEqual([{ id: 1 }]);
    expect(queryEngine.runDatasourceQuery).toHaveBeenCalledWith(dto);
  });
});
