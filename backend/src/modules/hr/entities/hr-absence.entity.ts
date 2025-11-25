import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { HrEmployee } from './hr-employee.entity';
import { User } from '../../auth/entities/user.entity';

export enum HrAbsenceType {
  VACATION = 'VACATION',
  SICK_LEAVE = 'SICK_LEAVE',
  UNPAID = 'UNPAID',
  OTHER = 'OTHER',
}

export enum HrAbsenceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('hr_absence')
export class HrAbsence {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => HrEmployee, { eager: true })
  @JoinColumn({ name: 'employee_id' })
  employee: HrEmployee;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ type: 'enum', enum: HrAbsenceType })
  type: HrAbsenceType;

  @Column({ type: 'enum', enum: HrAbsenceStatus })
  status: HrAbsenceStatus;

  @Column({ name: 'requested_at', type: 'timestamp' })
  requestedAt: Date;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'validated_by' })
  validatedBy?: User;

  @Column({ name: 'validated_at', type: 'timestamp', nullable: true })
  validatedAt?: Date;

  @Column({ nullable: true })
  comment?: string;
}
