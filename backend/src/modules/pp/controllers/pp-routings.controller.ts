import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PpRoutingsService } from '../services/pp-routings.service';
import { CreateRoutingDto } from '../dto/create-routing.dto';
import { UpdateRoutingDto } from '../dto/update-routing.dto';

@Controller('pp/routings')
export class PpRoutingsController {
  constructor(private readonly routingsService: PpRoutingsService) {}

  @Post()
  create(@Body() dto: CreateRoutingDto) {
    return this.routingsService.create(dto);
  }

  @Get()
  findAll(@Query('company_id') companyId?: string, @Query('material_id') materialId?: string) {
    return this.routingsService.findAll(companyId ? Number(companyId) : undefined, materialId ? Number(materialId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routingsService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoutingDto) {
    return this.routingsService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.routingsService.remove(Number(id));
  }
}
