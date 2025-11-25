import { Body, Controller, Post } from '@nestjs/common';
import { QmInspectionResultsService } from '../services/qm-inspection-results.service';
import { CreateInspectionResultDto } from '../dto/create-inspection-result.dto';

@Controller('qm/inspection-results')
export class QmInspectionResultsController {
  constructor(private readonly inspectionResultsService: QmInspectionResultsService) {}

  @Post()
  recordResult(@Body() dto: CreateInspectionResultDto) {
    return this.inspectionResultsService.recordResult(dto);
  }
}
