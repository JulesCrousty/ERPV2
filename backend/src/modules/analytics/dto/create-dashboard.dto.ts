import { IsArray, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateDashboardDto {
  @IsInt()
  company_id: number;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  layout: any;

  @IsArray()
  widgets: any[];
}
