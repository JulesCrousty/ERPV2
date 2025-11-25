import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePayrollPeriodDto {
  @IsNumber()
  company_id: number;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;
}
