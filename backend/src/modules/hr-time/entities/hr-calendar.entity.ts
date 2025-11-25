import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Company } from '../../core/entities/company.entity';
import { HrCalendarException } from './hr-calendar-exception.entity';

@Entity('hr_calendar')
export class HrCalendar {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  name: string;

  @OneToMany(() => HrCalendarException, (exception) => exception.calendar, { cascade: true })
  exceptions: HrCalendarException[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
