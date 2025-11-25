import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PpWorkCentersService } from '../services/pp-work-centers.service';
import { CreateWorkCenterDto } from '../dto/create-work-center.dto';
import { UpdateWorkCenterDto } from '../dto/update-work-center.dto';

@Controller('pp/work-centers')
export class PpWorkCentersController {
  constructor(private readonly workCentersService: PpWorkCentersService) {}

  @Post()
  create(@Body() dto: CreateWorkCenterDto) {
    return this.workCentersService.create(dto);
  }

  @Get()
  findAll(@Query('company_id') companyId?: string) {
    return this.workCentersService.findAll(companyId ? Number(companyId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workCentersService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkCenterDto) {
    return this.workCentersService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workCentersService.remove(Number(id));
  }
}
