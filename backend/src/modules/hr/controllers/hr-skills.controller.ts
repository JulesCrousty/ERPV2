import { Body, Controller, Get, Post } from '@nestjs/common';
import { HrSkillsService } from '../services/hr-skills.service';
import { CreateSkillDto } from '../dto/create-skill.dto';
import { AssignSkillDto } from '../dto/assign-skill.dto';

@Controller('hr/skills')
export class HrSkillsController {
  constructor(private readonly skillsService: HrSkillsService) {}

  @Post()
  create(@Body() dto: CreateSkillDto) {
    return this.skillsService.create(dto);
  }

  @Get()
  findAll() {
    return this.skillsService.findAll();
  }

  @Post('assign')
  assign(@Body() dto: AssignSkillDto) {
    return this.skillsService.assign(dto);
  }
}
