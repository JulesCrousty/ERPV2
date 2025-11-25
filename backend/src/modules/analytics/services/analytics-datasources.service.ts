import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Company } from '../../core/entities/company.entity';
import { AnalyticsDataSource } from '../entities/analytics-datasource.entity';
import { CreateDataSourceDto } from '../dto/create-datasource.dto';
import { QueryDataSourceDto } from '../dto/query-datasource.dto';
import { AnalyticsQueryEngineService } from './analytics-query-engine.service';

@Injectable()
export class AnalyticsDatasourcesService {
  private readonly logger = new Logger(AnalyticsDatasourcesService.name);

  constructor(
    @InjectRepository(AnalyticsDataSource)
    private readonly datasourcesRepository: Repository<AnalyticsDataSource>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    private readonly dataSource: DataSource,
    private readonly queryEngine: AnalyticsQueryEngineService,
  ) {}

  async create(dto: CreateDataSourceDto): Promise<AnalyticsDataSource> {
    this.logger.log(`Creating analytics datasource ${dto.code}`);
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    try {
      this.dataSource.getMetadata(dto.entity_name);
    } catch (error) {
      throw new BadRequestException('Entity does not exist in TypeORM metadata');
    }

    const metadata = this.dataSource.getMetadata(dto.entity_name);
    const availableColumns = metadata.columns.map((c) => c.propertyName ?? c.databaseName);
    dto.allowed_fields.forEach((field) => {
      if (!availableColumns.includes(field)) {
        throw new BadRequestException(`Allowed field ${field} does not exist on entity`);
      }
    });
    dto.filterable_fields.forEach((field) => {
      if (!availableColumns.includes(field)) {
        throw new BadRequestException(`Filterable field ${field} does not exist on entity`);
      }
    });

    const datasource = this.datasourcesRepository.create({
      company,
      code: dto.code,
      name: dto.name,
      description: dto.description,
      entityName: dto.entity_name,
      allowedFields: dto.allowed_fields,
      filterableFields: dto.filterable_fields,
    });
    return this.datasourcesRepository.save(datasource);
  }

  findAll(): Promise<AnalyticsDataSource[]> {
    return this.datasourcesRepository.find();
  }

  async findOne(id: number): Promise<AnalyticsDataSource> {
    const datasource = await this.datasourcesRepository.findOne({ where: { id } });
    if (!datasource) {
      throw new NotFoundException('Datasource not found');
    }
    return datasource;
  }

  async query(dto: QueryDataSourceDto): Promise<any[]> {
    return this.queryEngine.runDatasourceQuery(dto);
  }
}
