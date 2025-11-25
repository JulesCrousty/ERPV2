import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HrPayrollPeriod, HrPayrollPeriodStatus } from '../entities/hr-payroll-period.entity';
import { Company } from '../../core/entities/company.entity';
import { CreatePayrollPeriodDto } from '../dto/create-payroll-period.dto';
import { HrPayrollResult, HrPayrollResultStatus } from '../entities/hr-payroll-result.entity';

@Injectable()
export class HrPayrollPeriodsService {
  private readonly logger = new Logger(HrPayrollPeriodsService.name);

  constructor(
    @InjectRepository(HrPayrollPeriod)
    private readonly periodsRepository: Repository<HrPayrollPeriod>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(HrPayrollResult)
    private readonly resultsRepository: Repository<HrPayrollResult>,
  ) {}

  async openPeriod(dto: CreatePayrollPeriodDto): Promise<HrPayrollPeriod> {
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const period = this.periodsRepository.create({
      company,
      code: dto.code,
      startDate: new Date(dto.start_date),
      endDate: new Date(dto.end_date),
      status: HrPayrollPeriodStatus.OPEN,
    });
    this.logger.log(`Opening payroll period ${period.code} for company ${company.id}`);
    return this.periodsRepository.save(period);
  }

  async closePeriod(id: number): Promise<HrPayrollPeriod> {
    const period = await this.periodsRepository.findOne({ where: { id } });
    if (!period) {
      throw new NotFoundException('Payroll period not found');
    }
    const pendingResults = await this.resultsRepository.count({
      where: { period: { id }, status: HrPayrollResultStatus.GENERATED },
    });
    if (pendingResults > 0) {
      throw new BadRequestException('Cannot close period with unapproved payroll results');
    }
    period.status = HrPayrollPeriodStatus.CLOSED;
    this.logger.log(`Closing payroll period ${period.code}`);
    return this.periodsRepository.save(period);
  }

  findAll(): Promise<HrPayrollPeriod[]> {
    return this.periodsRepository.find();
  }

  findOne(id: number): Promise<HrPayrollPeriod | null> {
    return this.periodsRepository.findOne({ where: { id } });
  }
}
