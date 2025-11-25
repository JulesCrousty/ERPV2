import { PartialType } from '@nestjs/mapped-types';
import { CreateFiDocumentDto } from './create-fi-document.dto';

export class UpdateFiDocumentDto extends PartialType(CreateFiDocumentDto) {}
