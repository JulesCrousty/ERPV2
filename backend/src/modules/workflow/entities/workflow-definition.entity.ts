import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../core/entities/company.entity';
import { WorkflowStepDefinition } from './workflow-step-definition.entity';
import { WorkflowCondition } from './workflow-condition.entity';
import { WorkflowInstance } from './workflow-instance.entity';

@Entity('workflow_definition')
@Index(['company', 'documentType', 'version'], { unique: true })
export class WorkflowDefinition {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  name: string;

  @Column({ name: 'document_type' })
  documentType: string;

  @Column()
  version: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => WorkflowStepDefinition, (step) => step.workflowDefinition, { cascade: true })
  steps: WorkflowStepDefinition[];

  @OneToMany(() => WorkflowCondition, (condition) => condition.workflowDefinition, { cascade: true })
  conditions: WorkflowCondition[];

  @OneToMany(() => WorkflowInstance, (instance) => instance.workflowDefinition)
  instances: WorkflowInstance[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
