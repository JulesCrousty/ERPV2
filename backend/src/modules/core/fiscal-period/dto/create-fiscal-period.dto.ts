import { IsDateString, IsInt, IsNotEmpty } from 'class-validator';

export class CreateFiscalPeriodDto {
  @IsInt()
  @IsNotEmpty()
  periodNumber: number;

  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @IsInt()
  @IsNotEmpty()
  fiscalYearId: number;
}
