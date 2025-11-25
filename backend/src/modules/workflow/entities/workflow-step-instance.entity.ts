import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WorkflowInstance } from './workflow-instance.entity';
import { User } from '../../auth/entities/user.entity';
import { HrDepartment } from '../../hr/entities/hr-department.entity';

export enum WorkflowStepInstanceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('workflow_step_instance')
export class WorkflowStepInstance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => WorkflowInstance, (instance) => instance.steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflow_instance_id' })
  workflowInstance: WorkflowInstance;

  @Column({ name: 'step_number' })
  stepNumber: number;

  @Column({ type: 'enum', enum: WorkflowStepInstanceStatus })
  status: WorkflowStepInstanceStatus;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'assigned_to_user_id' })
  assignedToUser: User | null;

  @Column({ name: 'assigned_to_role', nullable: true })
  assignedToRole: string | null;

  @ManyToOne(() => HrDepartment, { nullable: true, eager: true })
  @JoinColumn({ name: 'assigned_to_department_id' })
  assignedToDepartment: HrDepartment | null;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'finished_at', type: 'timestamp', nullable: true })
  finishedAt: Date | null;
}
