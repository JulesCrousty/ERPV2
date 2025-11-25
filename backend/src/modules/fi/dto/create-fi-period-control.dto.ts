import { IsBoolean, IsNumber } from 'class-validator';

export class CreateFiPeriodControlDto {
  @IsNumber()
  company_id: number;

  @IsNumber()
  fiscal_year_id: number;

  @IsNumber()
  fiscal_period_id: number;

  @IsBoolean()
  is_open_for_posting: boolean;
}
