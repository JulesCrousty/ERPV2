import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { HrEmployee } from '../../hr/entities/hr-employee.entity';
import { HrOvertimeRule } from './hr-overtime-rule.entity';
import { User } from '../../auth/entities/user.entity';

export enum HrOvertimeEntryStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

@Entity('hr_overtime_entry')
export class HrOvertimeEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => HrEmployee, { eager: true })
  @JoinColumn({ name: 'employee_id' })
  employee: HrEmployee;

  @ManyToOne(() => HrOvertimeRule, { eager: true })
  @JoinColumn({ name: 'rule_id' })
  rule: HrOvertimeRule;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'int' })
  minutes: number;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'validated_by' })
  validatedBy?: User | null;

  @Column({ name: 'validated_at', type: 'timestamp', nullable: true })
  validatedAt?: Date | null;

  @Column({ type: 'varchar' })
  status: HrOvertimeEntryStatus;
}
