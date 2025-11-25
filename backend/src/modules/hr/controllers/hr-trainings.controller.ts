import { Body, Controller, Get, Post } from '@nestjs/common';
import { HrTrainingsService } from '../services/hr-trainings.service';
import { CreateTrainingDto } from '../dto/create-training.dto';
import { AssignTrainingDto } from '../dto/assign-training.dto';

@Controller('hr/trainings')
export class HrTrainingsController {
  constructor(private readonly trainingsService: HrTrainingsService) {}

  @Post()
  create(@Body() dto: CreateTrainingDto) {
    return this.trainingsService.create(dto);
  }

  @Get()
  findAll() {
    return this.trainingsService.findAll();
  }

  @Post('assign')
  assign(@Body() dto: AssignTrainingDto) {
    return this.trainingsService.assign(dto);
  }
}
