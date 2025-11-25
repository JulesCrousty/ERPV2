import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { FiscalPeriod } from './fiscal-period.entity';

@Entity('core_fiscal_year')
export class FiscalYear {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  year: number;

  @Column({ type: 'date' })
  start_date: string;

  @Column({ type: 'date' })
  end_date: string;

  @OneToMany(() => FiscalPeriod, (period) => period.fiscalYear)
  periods: FiscalPeriod[];
}
