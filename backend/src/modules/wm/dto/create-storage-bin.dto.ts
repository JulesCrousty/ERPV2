import { IsInt, IsString } from 'class-validator';

export class CreateStorageBinDto {
  @IsInt()
  storage_type_id: number;

  @IsString()
  code: string;
}
