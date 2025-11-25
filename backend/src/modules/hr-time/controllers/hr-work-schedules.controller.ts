import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { HrWorkSchedulesService } from '../services/hr-work-schedules.service';
import { CreateWorkScheduleDto } from '../dto/create-work-schedule.dto';
import { UpdateWorkScheduleDto } from '../dto/update-work-schedule.dto';

@Controller('hr-time/schedules')
export class HrWorkSchedulesController {
  constructor(private readonly service: HrWorkSchedulesService) {}

  @Post()
  create(@Body() dto: CreateWorkScheduleDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkScheduleDto) {
    return this.service.update(Number(id), dto);
  }

  @Patch(':id/assign/:employeeId')
  assign(@Param('id') id: string, @Param('employeeId') employeeId: string) {
    return this.service.assignToEmployee(Number(id), Number(employeeId));
  }
}
