import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { WorkflowDefinition } from './workflow-definition.entity';

@Entity('workflow_condition')
export class WorkflowCondition {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => WorkflowDefinition, (workflow) => workflow.conditions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflow_definition_id' })
  workflowDefinition: WorkflowDefinition;

  @Column()
  expression: string;

  @Column({ name: 'step_number' })
  stepNumber: number;

  @Column()
  priority: number;
}
