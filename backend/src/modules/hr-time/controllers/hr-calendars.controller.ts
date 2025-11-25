import { Body, Controller, Param, Post } from '@nestjs/common';
import { HrCalendarsService } from '../services/hr-calendars.service';
import { CreateCalendarDto } from '../dto/create-calendar.dto';
import { CreateCalendarExceptionDto } from '../dto/create-calendar-exception.dto';

@Controller('hr-time/calendars')
export class HrCalendarsController {
  constructor(private readonly service: HrCalendarsService) {}

  @Post()
  create(@Body() dto: CreateCalendarDto) {
    return this.service.createCalendar(dto);
  }

  @Post(':id/exceptions')
  addException(@Param('id') id: string, @Body() dto: CreateCalendarExceptionDto) {
    return this.service.addException({ ...dto, calendar_id: Number(id) });
  }
}
