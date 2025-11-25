import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { HrTimePunchesService } from '../services/hr-time-punches.service';
import { CreateTimePunchDto } from '../dto/create-time-punch.dto';
import { CorrectTimePunchDto } from '../dto/correct-time-punch.dto';

@Controller('hr-time/punches')
export class HrTimePunchesController {
  constructor(private readonly service: HrTimePunchesService) {}

  @Post()
  punch(@Body() dto: CreateTimePunchDto) {
    return this.service.punch(dto);
  }

  @Post('corrections')
  correct(@Body() dto: CorrectTimePunchDto) {
    return this.service.requestCorrection(dto);
  }

  @Get('presence/:employeeId/:date')
  presence(@Param('employeeId') employeeId: string, @Param('date') date: string) {
    return this.service.calculateDailyPresence(Number(employeeId), new Date(date));
  }
}
