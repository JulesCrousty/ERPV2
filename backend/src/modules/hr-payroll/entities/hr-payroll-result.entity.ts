import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { HrEmployee } from '../../hr/entities/hr-employee.entity';
import { HrPayrollPeriod } from './hr-payroll-period.entity';

enum HrPayrollResultStatus {
  GENERATED = 'GENERATED',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
}

@Entity('hr_payroll_result')
export class HrPayrollResult {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => HrEmployee, { eager: true })
  @JoinColumn({ name: 'employee_id' })
  employee: HrEmployee;

  @ManyToOne(() => HrPayrollPeriod, { eager: true })
  @JoinColumn({ name: 'period_id' })
  period: HrPayrollPeriod;

  @Column({ name: 'gross_salary', type: 'numeric', precision: 15, scale: 2 })
  grossSalary: number;

  @Column({ name: 'taxable_salary', type: 'numeric', precision: 15, scale: 2 })
  taxableSalary: number;

  @Column({ name: 'employee_contributions', type: 'numeric', precision: 15, scale: 2 })
  employeeContributions: number;

  @Column({ name: 'employer_contributions', type: 'numeric', precision: 15, scale: 2 })
  employerContributions: number;

  @Column({ name: 'net_salary', type: 'numeric', precision: 15, scale: 2 })
  netSalary: number;

  @Column({ type: 'enum', enum: HrPayrollResultStatus })
  status: HrPayrollResultStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export { HrPayrollResultStatus };
