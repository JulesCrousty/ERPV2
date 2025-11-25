import { IsInt, IsString } from 'class-validator';

export class CreateWorkflowConditionDto {
  @IsString()
  expression: string;

  @IsInt()
  step_number: number;

  @IsInt()
  priority: number;
}
