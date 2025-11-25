import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WorkflowDefinition } from './workflow-definition.entity';
import { WorkflowStepInstance } from './workflow-step-instance.entity';

export enum WorkflowInstanceStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

@Entity('workflow_instance')
export class WorkflowInstance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => WorkflowDefinition, (definition) => definition.instances, { eager: true })
  @JoinColumn({ name: 'workflow_definition_id' })
  workflowDefinition: WorkflowDefinition;

  @Column({ name: 'document_type' })
  documentType: string;

  @Column({ name: 'document_id' })
  documentId: number;

  @Column({ type: 'enum', enum: WorkflowInstanceStatus })
  status: WorkflowInstanceStatus;

  @Column({ name: 'current_step_number', nullable: true })
  currentStepNumber: number | null;

  @OneToMany(() => WorkflowStepInstance, (step) => step.workflowInstance, { cascade: true })
  steps: WorkflowStepInstance[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
