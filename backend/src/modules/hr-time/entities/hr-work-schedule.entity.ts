import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../core/entities/company.entity';
import { HrEmployee } from '../../hr/entities/hr-employee.entity';
import { HrWorkScheduleDay } from './hr-work-schedule-day.entity';

@Entity('hr_work_schedule')
export class HrWorkSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => HrEmployee, { eager: true, nullable: true })
  @JoinColumn({ name: 'employee_id' })
  employee?: HrEmployee | null;

  @Column()
  name: string;

  @Column({ name: 'weekly_hours', type: 'numeric', precision: 10, scale: 2 })
  weeklyHours: number;

  @OneToMany(() => HrWorkScheduleDay, (day) => day.workSchedule, { cascade: true })
  days: HrWorkScheduleDay[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
