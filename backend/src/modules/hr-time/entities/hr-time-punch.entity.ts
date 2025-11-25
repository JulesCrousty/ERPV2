import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { HrEmployee } from '../../hr/entities/hr-employee.entity';
import { User } from '../../auth/entities/user.entity';

export enum HrTimePunchType {
  IN = 'IN',
  OUT = 'OUT',
  BREAK_START = 'BREAK_START',
  BREAK_END = 'BREAK_END',
}

export enum HrTimePunchSource {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
}

@Entity('hr_time_punch')
export class HrTimePunch {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => HrEmployee, { eager: true })
  @JoinColumn({ name: 'employee_id' })
  employee: HrEmployee;

  @Column({ name: 'punch_type', type: 'varchar' })
  punchType: HrTimePunchType;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'varchar' })
  source: HrTimePunchSource;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
