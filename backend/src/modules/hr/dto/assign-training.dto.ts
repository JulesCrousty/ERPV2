import { IsDateString, IsInt, IsOptional } from 'class-validator';

export class AssignTrainingDto {
  @IsInt()
  training_id: number;

  @IsInt()
  employee_id: number;

  @IsDateString()
  assigned_at: string;

  @IsOptional()
  @IsDateString()
  completion_date?: string;
}
