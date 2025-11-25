import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { WorkflowActionType } from '../entities/workflow-action.entity';

export class TakeActionDto {
  @IsInt()
  step_instance_id: number;

  @IsEnum(WorkflowActionType)
  action: WorkflowActionType;

  @IsOptional()
  @IsString()
  comment?: string;
}
