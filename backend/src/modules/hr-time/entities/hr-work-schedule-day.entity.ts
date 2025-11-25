import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { HrWorkSchedule } from './hr-work-schedule.entity';

@Entity('hr_work_schedule_day')
@Unique(['workSchedule', 'weekday'])
export class HrWorkScheduleDay {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => HrWorkSchedule, (schedule) => schedule.days, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'work_schedule_id' })
  workSchedule: HrWorkSchedule;

  @Column({ type: 'int' })
  weekday: number;

  @Column({ name: 'start_time' })
  startTime: string;

  @Column({ name: 'end_time' })
  endTime: string;

  @Column({ name: 'break_minutes', type: 'int' })
  breakMinutes: number;
}
