import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../core/entities/company.entity';

enum HrPayrollPeriodStatus {
  OPEN = 'OPEN',
  PROCESSING = 'PROCESSING',
  CLOSED = 'CLOSED',
}

@Entity('hr_payroll_period')
@Index(['company', 'code'], { unique: true })
export class HrPayrollPeriod {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  code: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ type: 'enum', enum: HrPayrollPeriodStatus })
  status: HrPayrollPeriodStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export { HrPayrollPeriodStatus };
