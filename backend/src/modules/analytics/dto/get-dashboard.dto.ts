import { IsNotEmpty, IsString } from 'class-validator';

export class GetDashboardDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
