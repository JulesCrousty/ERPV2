import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../core/entities/company.entity';
import { AnalyticsDataset } from '../entities/analytics-dataset.entity';
import { CreateDatasetDto } from '../dto/create-dataset.dto';
import { RunDatasetDto } from '../dto/run-dataset.dto';
import { AnalyticsQueryEngineService } from './analytics-query-engine.service';

@Injectable()
export class AnalyticsDatasetsService {
  private readonly logger = new Logger(AnalyticsDatasetsService.name);

  constructor(
    @InjectRepository(AnalyticsDataset)
    private readonly datasetsRepository: Repository<AnalyticsDataset>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    private readonly queryEngine: AnalyticsQueryEngineService,
  ) {}

  async create(dto: CreateDatasetDto): Promise<AnalyticsDataset> {
    this.logger.log(`Creating analytics dataset ${dto.code}`);
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const dataset = this.datasetsRepository.create({
      company,
      code: dto.code,
      name: dto.name,
      datasources: dto.datasources,
      fields: dto.fields,
      filters: dto.filters,
    });
    return this.datasetsRepository.save(dataset);
  }

  async run(dto: RunDatasetDto): Promise<any[]> {
    const dataset = await this.datasetsRepository.findOne({ where: { code: dto.dataset_code }, relations: ['company'] });
    if (!dataset) {
      throw new NotFoundException('Dataset not found');
    }
    return this.queryEngine.runDataset(dataset, dto.filters);
  }
}
