import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FiscalPeriod } from '../entities/fiscal-period.entity';
import { FiscalYear } from '../entities/fiscal-year.entity';
import { CreateFiscalPeriodDto } from './dto/create-fiscal-period.dto';
import { UpdateFiscalPeriodDto } from './dto/update-fiscal-period.dto';

@Injectable()
export class FiscalPeriodService {
  constructor(
    @InjectRepository(FiscalPeriod)
    private readonly fiscalPeriodRepository: Repository<FiscalPeriod>,
    @InjectRepository(FiscalYear)
    private readonly fiscalYearRepository: Repository<FiscalYear>,
  ) {}

  async create(createFiscalPeriodDto: CreateFiscalPeriodDto): Promise<FiscalPeriod> {
    const fiscalYear = await this.fiscalYearRepository.findOne({ where: { id: createFiscalPeriodDto.fiscalYearId } });
    if (!fiscalYear) {
      throw new NotFoundException('Fiscal year not found');
    }

    const period = this.fiscalPeriodRepository.create({
      periodNumber: createFiscalPeriodDto.periodNumber,
      start_date: createFiscalPeriodDto.start_date,
      end_date: createFiscalPeriodDto.end_date,
      fiscalYear,
    });
    return this.fiscalPeriodRepository.save(period);
  }

  findAll(): Promise<FiscalPeriod[]> {
    return this.fiscalPeriodRepository.find({ relations: ['fiscalYear'] });
  }

  async findOne(id: number): Promise<FiscalPeriod> {
    const fiscalPeriod = await this.fiscalPeriodRepository.findOne({ where: { id }, relations: ['fiscalYear'] });
    if (!fiscalPeriod) {
      throw new NotFoundException('Fiscal period not found');
    }
    return fiscalPeriod;
  }

  async update(id: number, updateFiscalPeriodDto: UpdateFiscalPeriodDto): Promise<FiscalPeriod> {
    const fiscalPeriod = await this.findOne(id);

    if (updateFiscalPeriodDto.fiscalYearId !== undefined) {
      const fiscalYear = await this.fiscalYearRepository.findOne({ where: { id: updateFiscalPeriodDto.fiscalYearId } });
      if (!fiscalYear) {
        throw new NotFoundException('Fiscal year not found');
      }
      fiscalPeriod.fiscalYear = fiscalYear;
    }

    if (updateFiscalPeriodDto.periodNumber !== undefined) {
      fiscalPeriod.periodNumber = updateFiscalPeriodDto.periodNumber;
    }
    if (updateFiscalPeriodDto.start_date !== undefined) {
      fiscalPeriod.start_date = updateFiscalPeriodDto.start_date;
    }
    if (updateFiscalPeriodDto.end_date !== undefined) {
      fiscalPeriod.end_date = updateFiscalPeriodDto.end_date;
    }

    return this.fiscalPeriodRepository.save(fiscalPeriod);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.fiscalPeriodRepository.delete(id);
  }
}
