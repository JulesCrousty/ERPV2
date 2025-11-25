import { IsArray, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateWorkflowStepDefinitionDto } from './create-workflow-step-definition.dto';
import { CreateWorkflowConditionDto } from './create-workflow-condition.dto';

export class CreateWorkflowDefinitionDto {
  @IsInt()
  company_id: number;

  @IsString()
  name: string;

  @IsString()
  document_type: string;

  @IsInt()
  version: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkflowStepDefinitionDto)
  steps: CreateWorkflowStepDefinitionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkflowConditionDto)
  conditions?: CreateWorkflowConditionDto[];
}
