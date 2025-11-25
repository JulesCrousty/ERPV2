import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { HrCalendar } from './hr-calendar.entity';

export enum HrCalendarExceptionType {
  HOLIDAY = 'HOLIDAY',
  REDUCED = 'REDUCED',
  CLOSED = 'CLOSED',
}

@Entity('hr_calendar_exception')
@Unique(['calendar', 'date'])
export class HrCalendarException {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => HrCalendar, (calendar) => calendar.exceptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'calendar_id' })
  calendar: HrCalendar;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'varchar' })
  type: HrCalendarExceptionType;

  @Column({ type: 'varchar', nullable: true })
  description?: string | null;
}
