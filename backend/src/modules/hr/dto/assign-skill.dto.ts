import { IsInt, Max, Min } from 'class-validator';

export class AssignSkillDto {
  @IsInt()
  employee_id: number;

  @IsInt()
  skill_id: number;

  @IsInt()
  @Min(1)
  @Max(5)
  level: number;
}
