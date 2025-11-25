import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HrPayrollRule } from '../entities/hr-payroll-rule.entity';
import { CreatePayrollRuleDto } from '../dto/create-payroll-rule.dto';
import { Company } from '../../core/entities/company.entity';

@Injectable()
export class HrPayrollRulesService {
  private readonly logger = new Logger(HrPayrollRulesService.name);

  constructor(
    @InjectRepository(HrPayrollRule)
    private readonly rulesRepository: Repository<HrPayrollRule>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  async create(dto: CreatePayrollRuleDto): Promise<HrPayrollRule> {
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const rule = this.rulesRepository.create({
      company,
      code: dto.code,
      name: dto.name,
      category: dto.category,
      calculationType: dto.calculation_type,
      amount: dto.amount ?? null,
      rate: dto.rate ?? null,
      formula: dto.formula ?? null,
      priority: dto.priority,
      isActive: dto.is_active ?? true,
    });
    this.logger.log(`Creating payroll rule ${rule.code} for company ${company.id}`);
    return this.rulesRepository.save(rule);
  }

  findAll(): Promise<HrPayrollRule[]> {
    return this.rulesRepository.find({ order: { priority: 'ASC' } });
  }

  async update(id: number, dto: Partial<CreatePayrollRuleDto>): Promise<HrPayrollRule> {
    const rule = await this.rulesRepository.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException('Payroll rule not found');
    }
    if (dto.company_id) {
      const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
      if (!company) {
        throw new NotFoundException('Company not found');
      }
      rule.company = company;
    }
    Object.assign(rule, {
      code: dto.code ?? rule.code,
      name: dto.name ?? rule.name,
      category: dto.category ?? rule.category,
      calculationType: dto.calculation_type ?? rule.calculationType,
      amount: dto.amount ?? rule.amount,
      rate: dto.rate ?? rule.rate,
      formula: dto.formula ?? rule.formula,
      priority: dto.priority ?? rule.priority,
      isActive: dto.is_active ?? rule.isActive,
    });
    this.logger.log(`Updating payroll rule ${rule.code}`);
    return this.rulesRepository.save(rule);
  }

  async remove(id: number): Promise<void> {
    const rule = await this.rulesRepository.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException('Payroll rule not found');
    }
    await this.rulesRepository.remove(rule);
  }
}
