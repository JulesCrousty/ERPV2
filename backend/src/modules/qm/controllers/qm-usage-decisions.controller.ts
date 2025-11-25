import { Body, Controller, Post } from '@nestjs/common';
import { QmUsageDecisionsService } from '../services/qm-usage-decisions.service';
import { CreateUsageDecisionDto } from '../dto/create-usage-decision.dto';

@Controller('qm/usage-decisions')
export class QmUsageDecisionsController {
  constructor(private readonly usageDecisionsService: QmUsageDecisionsService) {}

  @Post()
  setDecision(@Body() dto: CreateUsageDecisionDto) {
    return this.usageDecisionsService.setDecision(dto);
  }
}
