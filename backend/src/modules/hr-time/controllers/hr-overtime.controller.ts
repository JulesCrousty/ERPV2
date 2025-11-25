import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { HrOvertimeService } from '../services/hr-overtime.service';
import { CreateOvertimeRuleDto } from '../dto/create-overtime-rule.dto';
import { CreateOvertimeEntryDto } from '../dto/create-overtime-entry.dto';

@Controller('hr-time/overtime')
export class HrOvertimeController {
  constructor(private readonly service: HrOvertimeService) {}

  @Post('rules')
  createRule(@Body() dto: CreateOvertimeRuleDto) {
    return this.service.createRule(dto);
  }

  @Post('entries')
  createEntry(@Body() dto: CreateOvertimeEntryDto) {
    return this.service.createEntry(dto);
  }

  @Patch('entries/:id/validate/:userId')
  validate(@Param('id') id: string, @Param('userId') userId: string) {
    return this.service.validateEntry(Number(id), Number(userId));
  }
}
