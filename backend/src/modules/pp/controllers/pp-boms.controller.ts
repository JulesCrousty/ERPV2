import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PpBomsService } from '../services/pp-boms.service';
import { CreateBomDto } from '../dto/create-bom.dto';
import { UpdateBomDto } from '../dto/update-bom.dto';

@Controller('pp/boms')
export class PpBomsController {
  constructor(private readonly bomsService: PpBomsService) {}

  @Post()
  create(@Body() dto: CreateBomDto) {
    return this.bomsService.create(dto);
  }

  @Get()
  findAll(@Query('company_id') companyId?: string, @Query('material_id') materialId?: string) {
    return this.bomsService.findAll(companyId ? Number(companyId) : undefined, materialId ? Number(materialId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bomsService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBomDto) {
    return this.bomsService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bomsService.remove(Number(id));
  }
}
