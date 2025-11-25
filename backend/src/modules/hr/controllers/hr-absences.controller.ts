import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { HrAbsencesService } from '../services/hr-absences.service';
import { CreateAbsenceDto } from '../dto/create-absence.dto';
import { UpdateAbsenceStatusDto } from '../dto/update-absence-status.dto';

@Controller('hr/absences')
export class HrAbsencesController {
  constructor(private readonly absencesService: HrAbsencesService) {}

  @Post()
  create(@Body() dto: CreateAbsenceDto) {
    return this.absencesService.create(dto);
  }

  @Get()
  findAll() {
    return this.absencesService.findAll();
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateAbsenceStatusDto) {
    return this.absencesService.updateStatus(Number(id), dto);
  }
}
