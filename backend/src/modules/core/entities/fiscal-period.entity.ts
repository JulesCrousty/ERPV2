import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { FiscalYear } from './fiscal-year.entity';

@Entity('core_fiscal_period')
export class FiscalPeriod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'period_number' })
  periodNumber: number;

  @Column({ type: 'date' })
  start_date: string;

  @Column({ type: 'date' })
  end_date: string;

  @ManyToOne(() => FiscalYear, (year) => year.periods, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fiscal_year_id' })
  fiscalYear: FiscalYear;
}
