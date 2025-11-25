import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { HrAbsenceRequestsService } from '../services/hr-absence-requests.service';
import { CreateAbsenceRequestDto } from '../dto/create-absence-request.dto';
import { UpdateAbsenceRequestStatusDto } from '../dto/update-absence-request-status.dto';

@Controller('hr-time/absences')
export class HrAbsenceRequestsController {
  constructor(private readonly service: HrAbsenceRequestsService) {}

  @Post()
  request(@Body() dto: CreateAbsenceRequestDto) {
    return this.service.requestAbsence(dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateAbsenceRequestStatusDto) {
    return this.service.updateStatus(Number(id), dto);
  }
}
