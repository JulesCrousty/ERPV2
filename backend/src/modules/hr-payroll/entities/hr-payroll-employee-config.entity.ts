import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { HrEmployee } from '../../hr/entities/hr-employee.entity';

@Entity('hr_payroll_employee_config')
export class HrPayrollEmployeeConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => HrEmployee, { eager: true })
  @JoinColumn({ name: 'employee_id' })
  employee: HrEmployee;

  @Column({ name: 'base_salary', type: 'numeric', precision: 15, scale: 2 })
  baseSalary: number;

  @Column()
  currency: string;

  @Column({ name: 'weekly_hours', type: 'numeric', precision: 10, scale: 2 })
  weeklyHours: number;

  @Column({ name: 'is_taxable', default: true })
  isTaxable: boolean;
}
