import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { HrPayrollPeriod, HrPayrollPeriodStatus } from '../entities/hr-payroll-period.entity';
import { HrPayrollRule, HrPayrollRuleCalculationType, HrPayrollRuleCategory } from '../entities/hr-payroll-rule.entity';
import { HrPayrollEmployeeConfig } from '../entities/hr-payroll-employee-config.entity';
import { HrPayrollInput, HrPayrollInputType } from '../entities/hr-payroll-input.entity';
import { HrPayrollResult, HrPayrollResultStatus } from '../entities/hr-payroll-result.entity';
import { HrPayrollResultLine } from '../entities/hr-payroll-result-line.entity';
import { HrEmployee } from '../../hr/entities/hr-employee.entity';
import { HrAbsence, HrAbsenceStatus } from '../../hr/entities/hr-absence.entity';
import { HrOvertimeEntry, HrOvertimeEntryStatus } from '../../hr-time/entities/hr-overtime-entry.entity';

@Injectable()
export class HrPayrollCalculationService {
  private readonly logger = new Logger(HrPayrollCalculationService.name);

  constructor(
    @InjectRepository(HrPayrollPeriod)
    private readonly periodsRepository: Repository<HrPayrollPeriod>,
    @InjectRepository(HrPayrollRule)
    private readonly rulesRepository: Repository<HrPayrollRule>,
    @InjectRepository(HrPayrollEmployeeConfig)
    private readonly employeeConfigRepository: Repository<HrPayrollEmployeeConfig>,
    @InjectRepository(HrPayrollInput)
    private readonly inputsRepository: Repository<HrPayrollInput>,
    @InjectRepository(HrPayrollResult)
    private readonly resultsRepository: Repository<HrPayrollResult>,
    @InjectRepository(HrPayrollResultLine)
    private readonly resultLinesRepository: Repository<HrPayrollResultLine>,
    @InjectRepository(HrEmployee)
    private readonly employeesRepository: Repository<HrEmployee>,
    @InjectRepository(HrAbsence)
    private readonly absencesRepository: Repository<HrAbsence>,
    @InjectRepository(HrOvertimeEntry)
    private readonly overtimeRepository: Repository<HrOvertimeEntry>,
    private readonly dataSource: DataSource,
  ) {}

  async generatePayroll(periodId: number, employeeIds: number[]): Promise<HrPayrollResult[]> {
    const period = await this.periodsRepository.findOne({ where: { id: periodId } });
    if (!period) {
      throw new NotFoundException('Payroll period not found');
    }
    if (period.status !== HrPayrollPeriodStatus.OPEN) {
      throw new BadRequestException('Payroll period is not open');
    }

    const rules = await this.rulesRepository.find({ where: { company: { id: period.company.id }, isActive: true }, order: { priority: 'ASC' } });
    const results: HrPayrollResult[] = [];

    for (const employeeId of employeeIds) {
      const employee = await this.employeesRepository.findOne({ where: { id: employeeId } });
      if (!employee) {
        throw new NotFoundException(`Employee ${employeeId} not found`);
      }
      const config = await this.employeeConfigRepository.findOne({ where: { employee: { id: employeeId } } });
      if (!config) {
        throw new BadRequestException(`Payroll config missing for employee ${employeeId}`);
      }
      const inputs = await this.inputsRepository.find({ where: { employee: { id: employeeId }, period: { id: periodId } } });
      const overtimeEntries = await this.overtimeRepository.find({
        where: {
          employee: { id: employeeId },
          status: HrOvertimeEntryStatus.APPROVED,
        },
      });
      const absences = await this.absencesRepository.find({ where: { employee: { id: employeeId }, status: HrAbsenceStatus.APPROVED } });

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        const calculation = this.calculateEmployeePayroll(period, employee, config, inputs, overtimeEntries, absences, rules);
        const payrollResult = queryRunner.manager.create(HrPayrollResult, {
          employee,
          period,
          grossSalary: calculation.grossSalary,
          taxableSalary: calculation.taxableSalary,
          employeeContributions: calculation.employeeContributions,
          employerContributions: calculation.employerContributions,
          netSalary: calculation.netSalary,
          status: HrPayrollResultStatus.GENERATED,
        });
        const savedResult = await queryRunner.manager.save(payrollResult);
        for (const line of calculation.lines) {
          const entity = queryRunner.manager.create(HrPayrollResultLine, {
            payrollResult: savedResult,
            rule: line.rule,
            label: line.label,
            amount: line.amount,
            quantity: line.quantity ?? null,
            isTaxable: line.isTaxable,
            isEmployeeExpense: line.isEmployeeExpense,
            isEmployerExpense: line.isEmployerExpense,
          });
          await queryRunner.manager.save(entity);
        }
        await queryRunner.commitTransaction();
        this.logger.log('Payroll generated', { employee_id: employee.id, period_id: period.id, net: calculation.netSalary });
        results.push(savedResult);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }

    return results;
  }

  private calculateEmployeePayroll(
    period: HrPayrollPeriod,
    employee: HrEmployee,
    config: HrPayrollEmployeeConfig,
    inputs: HrPayrollInput[],
    overtimeEntries: HrOvertimeEntry[],
    absences: HrAbsence[],
    rules: HrPayrollRule[],
  ) {
    const periodStart = new Date(period.startDate);
    const periodEnd = new Date(period.endDate);
    const daysInPeriod = (periodEnd.getTime() - periodStart.getTime()) / (1000 * 3600 * 24) + 1;
    const daysInMonth = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0).getDate();
    const proratedBase = Number(((Number(config.baseSalary) * daysInPeriod) / daysInMonth).toFixed(2));

    const overtimeHours =
      inputs.filter((i) => i.type === HrPayrollInputType.OVERTIME).reduce((sum, item) => sum + Number(item.quantity ?? 0), 0) +
      overtimeEntries
        .filter((entry) => entry.date >= periodStart && entry.date <= periodEnd)
        .reduce((sum, entry) => sum + entry.minutes / 60, 0);

    const absenceDays =
      inputs.filter((i) => i.type === HrPayrollInputType.ABSENCE).reduce((sum, item) => sum + Number(item.quantity ?? 0), 0) +
      absences
        .filter((a) => a.startDate <= periodEnd && a.endDate >= periodStart)
        .reduce((sum, a) => sum + ((a.endDate.getTime() - a.startDate.getTime()) / (1000 * 3600 * 24) + 1), 0);

    const lines: Array<{ rule?: HrPayrollRule | null; label: string; amount: number; quantity?: number; isTaxable: boolean; isEmployeeExpense: boolean; isEmployerExpense: boolean }> = [];
    lines.push({
      label: 'Base salary',
      amount: proratedBase,
      quantity: daysInPeriod,
      isTaxable: config.isTaxable,
      isEmployeeExpense: true,
      isEmployerExpense: false,
    });

    let grossSalary = proratedBase;
    let employeeContributions = 0;
    let employerContributions = 0;

    const ruleLines = (category: HrPayrollRuleCategory) => rules.filter((r) => r.category === category && r.isActive);

    for (const rule of ruleLines(HrPayrollRuleCategory.ALLOWANCE)) {
      const amount = this.computeRuleAmount(rule, proratedBase, overtimeHours, absenceDays);
      if (amount !== 0) {
        lines.push({ rule, label: rule.name, amount, isTaxable: true, isEmployeeExpense: true, isEmployerExpense: false });
        grossSalary += amount;
      }
    }

    for (const rule of ruleLines(HrPayrollRuleCategory.OVERTIME)) {
      const amount = this.computeRuleAmount(rule, proratedBase, overtimeHours, absenceDays, overtimeHours);
      if (amount !== 0) {
        lines.push({
          rule,
          label: rule.name,
          amount,
          quantity: overtimeHours,
          isTaxable: true,
          isEmployeeExpense: true,
          isEmployerExpense: false,
        });
        grossSalary += amount;
      }
    }

    if (absenceDays > 0) {
      const absenceRules = ruleLines(HrPayrollRuleCategory.ABSENCE);
      const absenceImpact = absenceRules.length > 0 ? this.computeRuleAmount(absenceRules[0], proratedBase, overtimeHours, absenceDays) : (proratedBase * absenceDays) / daysInPeriod;
      const amount = Number(absenceImpact.toFixed(2)) * -1;
      lines.push({
        rule: absenceRules[0],
        label: absenceRules[0]?.name ?? 'Absences',
        amount,
        quantity: absenceDays,
        isTaxable: false,
        isEmployeeExpense: true,
        isEmployerExpense: false,
      });
      grossSalary += amount;
    }

    for (const rule of ruleLines(HrPayrollRuleCategory.DEDUCTION)) {
      const amount = this.computeRuleAmount(rule, grossSalary, overtimeHours, absenceDays);
      if (amount !== 0) {
        const deduction = Number(amount.toFixed(2));
        lines.push({
          rule,
          label: rule.name,
          amount: deduction * -1,
          isTaxable: false,
          isEmployeeExpense: true,
          isEmployerExpense: false,
        });
        employeeContributions += deduction;
      }
    }

    for (const rule of ruleLines(HrPayrollRuleCategory.EMPLOYER_CONTRIBUTION)) {
      const amount = this.computeRuleAmount(rule, grossSalary, overtimeHours, absenceDays);
      if (amount !== 0) {
        const contribution = Number(amount.toFixed(2));
        lines.push({
          rule,
          label: rule.name,
          amount: contribution,
          isTaxable: false,
          isEmployeeExpense: false,
          isEmployerExpense: true,
        });
        employerContributions += contribution;
      }
    }

    const taxableSalary = Number((grossSalary - employeeContributions).toFixed(2));
    const netSalary = Number((grossSalary - employeeContributions).toFixed(2));

    return { grossSalary: Number(grossSalary.toFixed(2)), taxableSalary, netSalary, employeeContributions, employerContributions, lines };
  }

  private computeRuleAmount(
    rule: HrPayrollRule,
    base: number,
    overtimeHours: number,
    absenceDays: number,
    quantity = 1,
  ): number {
    switch (rule.calculationType) {
      case HrPayrollRuleCalculationType.FIXED:
        return Number(((rule.amount ?? 0) * quantity).toFixed(2));
      case HrPayrollRuleCalculationType.RATE:
        return Number(((base * (rule.rate ?? 0)) * quantity).toFixed(2));
      case HrPayrollRuleCalculationType.FORMULA: {
        try {
          const fn = new Function('base', 'rate', 'amount', 'overtimeHours', 'absenceDays', 'quantity', `return ${rule.formula};`);
          const result = fn(base, rule.rate ?? 0, rule.amount ?? 0, overtimeHours, absenceDays, quantity);
          return Number(Number(result).toFixed(2));
        } catch (error) {
          this.logger.error('Error evaluating payroll rule formula', { rule: rule.code, error });
          return 0;
        }
      }
      default:
        return 0;
    }
  }
}
