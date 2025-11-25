import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CorrectTimePunchDto {
  @IsInt()
  time_punch_id: number;

  @IsInt()
  requested_by: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsDateString()
  new_timestamp: string;
}
