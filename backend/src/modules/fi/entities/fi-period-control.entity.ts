import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Company } from '../../core/entities/company.entity';
import { FiscalYear } from '../../core/entities/fiscal-year.entity';
import { FiscalPeriod } from '../../core/entities/fiscal-period.entity';

@Entity('fi_period_control')
@Index(['company', 'fiscalPeriod'], { unique: true })
export class FiPeriodControl {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => FiscalYear, { eager: true })
  @JoinColumn({ name: 'fiscal_year_id' })
  fiscalYear: FiscalYear;

  @ManyToOne(() => FiscalPeriod, { eager: true })
  @JoinColumn({ name: 'fiscal_period_id' })
  fiscalPeriod: FiscalPeriod;

  @Column({ name: 'is_open_for_posting', default: true })
  isOpenForPosting: boolean;
}
