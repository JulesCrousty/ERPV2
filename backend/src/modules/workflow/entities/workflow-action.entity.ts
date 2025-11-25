import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { WorkflowStepInstance } from './workflow-step-instance.entity';
import { User } from '../../auth/entities/user.entity';

export enum WorkflowActionType {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  REQUEST_MODIFICATION = 'REQUEST_MODIFICATION',
}

@Entity('workflow_action')
export class WorkflowAction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => WorkflowStepInstance, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'step_instance_id' })
  stepInstance: WorkflowStepInstance;

  @Column({ name: 'action_type', type: 'enum', enum: WorkflowActionType })
  actionType: WorkflowActionType;

  @Column({ nullable: true })
  comment: string | null;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'acted_by' })
  actedBy: User | null;

  @Column({ name: 'acted_at', type: 'timestamp' })
  actedAt: Date;
}
