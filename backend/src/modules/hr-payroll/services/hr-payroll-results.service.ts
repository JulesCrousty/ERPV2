import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HrPayrollResult, HrPayrollResultStatus } from '../entities/hr-payroll-result.entity';

@Injectable()
export class HrPayrollResultsService {
  private readonly logger = new Logger(HrPayrollResultsService.name);

  constructor(
    @InjectRepository(HrPayrollResult)
    private readonly resultsRepository: Repository<HrPayrollResult>,
  ) {}

  async approve(resultId: number): Promise<HrPayrollResult> {
    const result = await this.resultsRepository.findOne({ where: { id: resultId } });
    if (!result) {
      throw new NotFoundException('Payroll result not found');
    }
    if (result.status === HrPayrollResultStatus.PAID) {
      throw new BadRequestException('Cannot approve a paid payroll result');
    }
    result.status = HrPayrollResultStatus.APPROVED;
    this.logger.log(`Payroll result ${result.id} approved`);
    return this.resultsRepository.save(result);
  }

  async markAsPaid(resultId: number): Promise<HrPayrollResult> {
    const result = await this.resultsRepository.findOne({ where: { id: resultId } });
    if (!result) {
      throw new NotFoundException('Payroll result not found');
    }
    if (result.status !== HrPayrollResultStatus.APPROVED) {
      throw new BadRequestException('Payroll result must be approved before payment');
    }
    result.status = HrPayrollResultStatus.PAID;
    this.logger.log(`Payroll result ${result.id} marked as paid and triggering FI posting event`);
    // Integration hook for FI posting event would be placed here.
    return this.resultsRepository.save(result);
  }

  findAll(): Promise<HrPayrollResult[]> {
    return this.resultsRepository.find();
  }
}
