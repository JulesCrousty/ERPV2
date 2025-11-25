import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCalendarDto {
  @IsInt()
  company_id: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}
