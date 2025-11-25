import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class UploadEmployeeDocumentDto {
  @IsInt()
  employee_id: number;

  @IsString()
  @IsNotEmpty()
  file_name: string;

  @IsString()
  @IsNotEmpty()
  file_path: string;

  @IsString()
  @IsNotEmpty()
  document_type: string;
}
