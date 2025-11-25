import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { HrEmployee } from '../../hr/entities/hr-employee.entity';
import { HrPayrollPeriod } from './hr-payroll-period.entity';

enum HrPayrollInputType {
  OVERTIME = 'OVERTIME',
  ABSENCE = 'ABSENCE',
  BONUS = 'BONUS',
  MANUAL = 'MANUAL',
}

@Entity('hr_payroll_input')
export class HrPayrollInput {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => HrEmployee, { eager: true })
  @JoinColumn({ name: 'employee_id' })
  employee: HrEmployee;

  @ManyToOne(() => HrPayrollPeriod, { eager: true })
  @JoinColumn({ name: 'period_id' })
  period: HrPayrollPeriod;

  @Column({ type: 'enum', enum: HrPayrollInputType })
  type: HrPayrollInputType;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  quantity: number | null;

  @Column({ type: 'numeric', precision: 15, scale: 2, nullable: true })
  amount: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

export { HrPayrollInputType };
