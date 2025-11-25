import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { HrTimePunch } from './hr-time-punch.entity';
import { User } from '../../auth/entities/user.entity';

export enum HrTimeCorrectionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('hr_time_correction')
export class HrTimeCorrection {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => HrTimePunch, { eager: true })
  @JoinColumn({ name: 'time_punch_id' })
  timePunch: HrTimePunch;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'requested_by' })
  requestedBy: User;

  @Column({ name: 'requested_at', type: 'timestamp' })
  requestedAt: Date;

  @Column()
  reason: string;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approvedBy?: User | null;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt?: Date | null;

  @Column({ name: 'new_timestamp', type: 'timestamp' })
  newTimestamp: Date;

  @Column({ type: 'varchar' })
  status: HrTimeCorrectionStatus;
}
