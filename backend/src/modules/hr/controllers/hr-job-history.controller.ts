import { Controller, Get } from '@nestjs/common';
import { HrJobHistoryService } from '../services/hr-job-history.service';

@Controller('hr/job-history')
export class HrJobHistoryController {
  constructor(private readonly jobHistoryService: HrJobHistoryService) {}

  @Get()
  findAll() {
    return this.jobHistoryService.findAll();
  }
}
