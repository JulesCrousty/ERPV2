import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FiscalYear } from '../entities/fiscal-year.entity';
import { CreateFiscalYearDto } from './dto/create-fiscal-year.dto';
import { UpdateFiscalYearDto } from './dto/update-fiscal-year.dto';

@Injectable()
export class FiscalYearService {
  constructor(
    @InjectRepository(FiscalYear)
    private readonly fiscalYearRepository: Repository<FiscalYear>,
  ) {}

  create(createFiscalYearDto: CreateFiscalYearDto): Promise<FiscalYear> {
    const year = this.fiscalYearRepository.create(createFiscalYearDto);
    return this.fiscalYearRepository.save(year);
  }

  findAll(): Promise<FiscalYear[]> {
    return this.fiscalYearRepository.find({ relations: ['periods'] });
  }

  async findOne(id: number): Promise<FiscalYear> {
    const fiscalYear = await this.fiscalYearRepository.findOne({ where: { id }, relations: ['periods'] });
    if (!fiscalYear) {
      throw new NotFoundException('Fiscal year not found');
    }
    return fiscalYear;
  }

  async update(id: number, updateFiscalYearDto: UpdateFiscalYearDto): Promise<FiscalYear> {
    const fiscalYear = await this.findOne(id);
    Object.assign(fiscalYear, updateFiscalYearDto);
    return this.fiscalYearRepository.save(fiscalYear);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.fiscalYearRepository.delete(id);
  }
}
