import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { HrEmployee } from '../../hr/entities/hr-employee.entity';
import { User } from '../../auth/entities/user.entity';

export enum HrAbsenceType {
  PAID_LEAVE = 'PAID_LEAVE',
  UNPAID_LEAVE = 'UNPAID_LEAVE',
  SICKNESS = 'SICKNESS',
  OTHER = 'OTHER',
}

export enum HrAbsenceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('hr_absence_request')
export class HrAbsenceRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => HrEmployee, { eager: true })
  @JoinColumn({ name: 'employee_id' })
  employee: HrEmployee;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ type: 'varchar' })
  type: HrAbsenceType;

  @Column({ type: 'varchar' })
  status: HrAbsenceStatus;

  @Column({ name: 'requested_at', type: 'timestamp' })
  requestedAt: Date;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'validated_by' })
  validatedBy?: User | null;

  @Column({ name: 'validated_at', type: 'timestamp', nullable: true })
  validatedAt?: Date | null;

  @Column({ type: 'varchar', nullable: true })
  comment?: string | null;
}
