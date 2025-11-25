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

enum HrPayrollRuleCategory {
  BASE = 'BASE',
  ALLOWANCE = 'ALLOWANCE',
  DEDUCTION = 'DEDUCTION',
  EMPLOYER_CONTRIBUTION = 'EMPLOYER_CONTRIBUTION',
  OVERTIME = 'OVERTIME',
  ABSENCE = 'ABSENCE',
}

enum HrPayrollRuleCalculationType {
  FIXED = 'FIXED',
  RATE = 'RATE',
  FORMULA = 'FORMULA',
}

@Entity('hr_payroll_rule')
@Index(['company', 'code'], { unique: true })
export class HrPayrollRule {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: HrPayrollRuleCategory })
  category: HrPayrollRuleCategory;

  @Column({ name: 'calculation_type', type: 'enum', enum: HrPayrollRuleCalculationType })
  calculationType: HrPayrollRuleCalculationType;

  @Column({ type: 'numeric', precision: 15, scale: 4, nullable: true })
  amount: number | null;

  @Column({ type: 'numeric', precision: 10, scale: 4, nullable: true })
  rate: number | null;

  @Column({ nullable: true })
  formula: string | null;

  @Column()
  priority: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export { HrPayrollRuleCategory, HrPayrollRuleCalculationType };
