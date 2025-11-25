import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { HrPayrollResult } from './hr-payroll-result.entity';
import { HrPayrollRule } from './hr-payroll-rule.entity';

@Entity('hr_payroll_result_line')
export class HrPayrollResultLine {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => HrPayrollResult, { eager: true })
  @JoinColumn({ name: 'payroll_result_id' })
  payrollResult: HrPayrollResult;

  @ManyToOne(() => HrPayrollRule, { eager: true, nullable: true })
  @JoinColumn({ name: 'rule_id' })
  rule?: HrPayrollRule | null;

  @Column()
  label: string;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  quantity: number | null;

  @Column({ name: 'is_taxable', default: true })
  isTaxable: boolean;

  @Column({ name: 'is_employee_expense', default: true })
  isEmployeeExpense: boolean;

  @Column({ name: 'is_employer_expense', default: false })
  isEmployerExpense: boolean;
}
