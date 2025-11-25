import { Body, Controller, Get, Post } from '@nestjs/common';
import { HrEmployeeDocumentsService } from '../services/hr-employee-documents.service';
import { UploadEmployeeDocumentDto } from '../dto/upload-employee-document.dto';

@Controller('hr/documents')
export class HrEmployeeDocumentsController {
  constructor(private readonly documentsService: HrEmployeeDocumentsService) {}

  @Post()
  upload(@Body() dto: UploadEmployeeDocumentDto) {
    return this.documentsService.upload(dto);
  }

  @Get()
  findAll() {
    return this.documentsService.findAll();
  }
}
