import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { MmMaterialsService } from '../services/mm-materials.service';
import { CreateMaterialDto } from '../dto/create-material.dto';
import { UpdateMaterialDto } from '../dto/update-material.dto';

@Controller('mm/materials')
export class MmMaterialsController {
  constructor(private readonly materialsService: MmMaterialsService) {}

  @Post()
  create(@Body() dto: CreateMaterialDto) {
    return this.materialsService.create(dto);
  }

  @Get()
  findAll(@Query('company_id') companyId?: string) {
    return this.materialsService.findAll(companyId ? Number(companyId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialsService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMaterialDto) {
    return this.materialsService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.materialsService.remove(Number(id));
  }
}
