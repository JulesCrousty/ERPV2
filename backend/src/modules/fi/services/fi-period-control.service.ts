import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../core/entities/company.entity';
import { FiscalPeriod } from '../../core/entities/fiscal-period.entity';
import { FiscalYear } from '../../core/entities/fiscal-year.entity';
import { CreateFiPeriodControlDto } from '../dto/create-fi-period-control.dto';
import { UpdateFiPeriodControlDto } from '../dto/update-fi-period-control.dto';
import { FiPeriodControl } from '../entities/fi-period-control.entity';

@Injectable()
export class FiPeriodControlService {
  constructor(
    @InjectRepository(FiPeriodControl)
    private readonly periodControlRepository: Repository<FiPeriodControl>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(FiscalYear)
    private readonly fiscalYearRepository: Repository<FiscalYear>,
    @InjectRepository(FiscalPeriod)
    private readonly fiscalPeriodRepository: Repository<FiscalPeriod>,
  ) {}

  async create(dto: CreateFiPeriodControlDto): Promise<FiPeriodControl> {
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const fiscalYear = await this.fiscalYearRepository.findOne({ where: { id: dto.fiscal_year_id } });
    if (!fiscalYear) {
      throw new NotFoundException('Fiscal year not found');
    }
    const fiscalPeriod = await this.fiscalPeriodRepository.findOne({ where: { id: dto.fiscal_period_id } });
    if (!fiscalPeriod) {
      throw new NotFoundException('Fiscal period not found');
    }

    const record = this.periodControlRepository.create({
      company,
      fiscalYear,
      fiscalPeriod,
      isOpenForPosting: dto.is_open_for_posting,
    });
    return this.periodControlRepository.save(record);
  }

  findAll(filters?: { company_id?: number; fiscal_year_id?: number }): Promise<FiPeriodControl[]> {
    const where: any = {};
    if (filters?.company_id) {
      where.company = { id: filters.company_id };
    }
    if (filters?.fiscal_year_id) {
      where.fiscalYear = { id: filters.fiscal_year_id };
    }
    return this.periodControlRepository.find({ where });
  }

  async findOne(id: number): Promise<FiPeriodControl> {
    const record = await this.periodControlRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException('Period control not found');
    }
    return record;
  }

  async update(id: number, dto: UpdateFiPeriodControlDto): Promise<FiPeriodControl> {
    const record = await this.findOne(id);

    if (dto.company_id && dto.company_id !== record.company.id) {
      const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
      if (!company) {
        throw new NotFoundException('Company not found');
      }
      record.company = company;
    }

    if (dto.fiscal_year_id && dto.fiscal_year_id !== record.fiscalYear.id) {
      const fiscalYear = await this.fiscalYearRepository.findOne({ where: { id: dto.fiscal_year_id } });
      if (!fiscalYear) {
        throw new NotFoundException('Fiscal year not found');
      }
      record.fiscalYear = fiscalYear;
    }

    if (dto.fiscal_period_id && dto.fiscal_period_id !== record.fiscalPeriod.id) {
      const fiscalPeriod = await this.fiscalPeriodRepository.findOne({ where: { id: dto.fiscal_period_id } });
      if (!fiscalPeriod) {
        throw new NotFoundException('Fiscal period not found');
      }
      record.fiscalPeriod = fiscalPeriod;
    }

    if (dto.is_open_for_posting !== undefined) {
      record.isOpenForPosting = dto.is_open_for_posting;
    }

    return this.periodControlRepository.save(record);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.periodControlRepository.delete(id);
  }

  async isPeriodOpen(companyId: number, fiscalPeriodId: number): Promise<boolean> {
    const record = await this.periodControlRepository.findOne({
      where: { company: { id: companyId }, fiscalPeriod: { id: fiscalPeriodId } },
    });
    return record?.isOpenForPosting ?? false;
  }
}
