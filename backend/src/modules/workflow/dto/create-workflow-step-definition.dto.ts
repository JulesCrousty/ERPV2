import { IsBoolean, IsEnum, IsInt, IsString } from 'class-validator';
import { ApproverType } from '../entities/workflow-step-definition.entity';

export class CreateWorkflowStepDefinitionDto {
  @IsInt()
  step_number: number;

  @IsString()
  name: string;

  @IsEnum(ApproverType)
  approver_type: ApproverType;

  @IsString()
  approver_value: string;

  @IsBoolean()
  auto_approve: boolean;
}
