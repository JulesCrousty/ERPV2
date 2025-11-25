import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CreateFiDocumentDto } from '../dto/create-fi-document.dto';
import { FiDocumentsService } from '../services/fi-documents.service';

@Controller('fi/documents')
export class FiDocumentsController {
  constructor(private readonly fiDocumentsService: FiDocumentsService) {}

  @Post()
  create(@Body() dto: CreateFiDocumentDto) {
    return this.fiDocumentsService.create(dto);
  }

  @Get()
  findAll(
    @Query('company_id') companyId?: string,
    @Query('period_id') periodId?: string,
    @Query('status') status?: string,
  ) {
    return this.fiDocumentsService.findAll({
      company_id: companyId ? Number(companyId) : undefined,
      period_id: periodId ? Number(periodId) : undefined,
      status,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fiDocumentsService.findOne(id);
  }

  @Post(':id/reverse')
  reverse(@Param('id', ParseIntPipe) id: number) {
    return this.fiDocumentsService.reverse(id);
  }
}
