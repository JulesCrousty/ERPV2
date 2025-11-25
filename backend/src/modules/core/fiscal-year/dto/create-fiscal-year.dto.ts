import { IsDateString, IsInt, IsNotEmpty } from 'class-validator';

export class CreateFiscalYearDto {
  @IsInt()
  @IsNotEmpty()
  year: number;

  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsDateString()
  @IsNotEmpty()
  end_date: string;
}
