import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WorkflowDefinition } from './workflow-definition.entity';

export enum ApproverType {
  USER = 'USER',
  ROLE = 'ROLE',
  DEPARTMENT = 'DEPARTMENT',
}

@Entity('workflow_step_definition')
export class WorkflowStepDefinition {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => WorkflowDefinition, (workflow) => workflow.steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflow_definition_id' })
  workflowDefinition: WorkflowDefinition;

  @Column({ name: 'step_number' })
  stepNumber: number;

  @Column()
  name: string;

  @Column({ name: 'approver_type', type: 'enum', enum: ApproverType })
  approverType: ApproverType;

  @Column({ name: 'approver_value' })
  approverValue: string;

  @Column({ name: 'auto_approve', default: false })
  autoApprove: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
