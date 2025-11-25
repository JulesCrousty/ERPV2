import { ArrayMinSize, IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { FiDocumentLineDto } from './fi-document-line.dto';

export class CreateFiDocumentDto {
  @IsNumber()
  company_id: number;

  @IsDateString()
  document_date: string;

  @IsDateString()
  posting_date: string;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsNumber()
  fiscal_period_id: number;

  @IsArray()
  @ArrayMinSize(2)
  lines: FiDocumentLineDto[];
}
