import { IsInt, IsObject, IsString } from 'class-validator';

export class StartWorkflowDto {
  @IsString()
  document_type: string;

  @IsInt()
  document_id: number;

  @IsInt()
  company_id: number;

  @IsObject()
  context: any;
}
