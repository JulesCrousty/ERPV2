import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { WmWarehousesService } from '../services/wm-warehouses.service';
import { CreateWarehouseDto } from '../dto/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/update-warehouse.dto';

@Controller('wm/warehouses')
export class WmWarehousesController {
  constructor(private readonly warehousesService: WmWarehousesService) {}

  @Post()
  create(@Body() dto: CreateWarehouseDto) {
    return this.warehousesService.create(dto);
  }

  @Get()
  findAll(@Query('company_id') companyId?: string) {
    return this.warehousesService.findAll(companyId ? Number(companyId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.warehousesService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWarehouseDto) {
    return this.warehousesService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.warehousesService.remove(Number(id));
  }
}
