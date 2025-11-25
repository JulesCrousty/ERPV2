import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HrOvertimeRule } from '../entities/hr-overtime-rule.entity';
import { HrOvertimeEntry, HrOvertimeEntryStatus } from '../entities/hr-overtime-entry.entity';
import { HrEmployee } from '../../hr/entities/hr-employee.entity';
import { CreateOvertimeRuleDto } from '../dto/create-overtime-rule.dto';
import { CreateOvertimeEntryDto } from '../dto/create-overtime-entry.dto';
import { Company } from '../../core/entities/company.entity';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class HrOvertimeService {
  private readonly logger = new Logger(HrOvertimeService.name);

  constructor(
    @InjectRepository(HrOvertimeRule)
    private readonly rulesRepository: Repository<HrOvertimeRule>,
    @InjectRepository(HrOvertimeEntry)
    private readonly entriesRepository: Repository<HrOvertimeEntry>,
    @InjectRepository(HrEmployee)
    private readonly employeesRepository: Repository<HrEmployee>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createRule(dto: CreateOvertimeRuleDto): Promise<HrOvertimeRule> {
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const rule = this.rulesRepository.create({
      company,
      code: dto.code,
      description: dto.description,
      rate: dto.rate,
      minMinutes: dto.min_minutes,
      maxMinutes: dto.max_minutes ?? null,
    });
    this.logger.log(`Overtime rule ${dto.code} created for company ${company.id}`);
    return this.rulesRepository.save(rule);
  }

  async createEntry(dto: CreateOvertimeEntryDto): Promise<HrOvertimeEntry> {
    const employee = await this.employeesRepository.findOne({ where: { id: dto.employee_id } });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    const rule = await this.rulesRepository.findOne({ where: { id: dto.rule_id } });
    if (!rule) {
      throw new NotFoundException('Rule not found');
    }
    const entry = this.entriesRepository.create({
      employee,
      rule,
      date: new Date(dto.date),
      minutes: dto.minutes,
      status: HrOvertimeEntryStatus.PENDING,
    });
    this.logger.log(`Overtime entry created for employee ${employee.id}`);
    return this.entriesRepository.save(entry);
  }

  async detectAndCreate(employee: HrEmployee, date: Date, overtimeMinutes: number): Promise<HrOvertimeEntry | null> {
    const rules = await this.rulesRepository.find({ where: { company: { id: employee.company.id } } });
    const applicable = rules.find((rule) =>
      overtimeMinutes >= rule.minMinutes && (rule.maxMinutes === null || overtimeMinutes <= (rule.maxMinutes ?? overtimeMinutes)),
    );
    if (!applicable) {
      this.logger.warn(`No overtime rule matches ${overtimeMinutes} minutes for company ${employee.company.id}`);
      return null;
    }
    const entry = this.entriesRepository.create({
      employee,
      rule: applicable,
      date,
      minutes: overtimeMinutes,
      status: HrOvertimeEntryStatus.PENDING,
    });
    this.logger.log(`Overtime entry created after OUT punch for employee ${employee.id}`);
    return this.entriesRepository.save(entry);
  }

  async validateEntry(id: number, validatorId: number): Promise<HrOvertimeEntry> {
    const entry = await this.entriesRepository.findOne({ where: { id } });
    if (!entry) {
      throw new NotFoundException('Overtime entry not found');
    }
    const user = await this.usersRepository.findOne({ where: { id: validatorId } });
    if (!user) {
      throw new NotFoundException('Validator not found');
    }
    entry.status = HrOvertimeEntryStatus.APPROVED;
    entry.validatedBy = user;
    entry.validatedAt = new Date();
    this.logger.log(`Overtime entry ${id} validated by user ${user.id}`);
    return this.entriesRepository.save(entry);
  }
}
