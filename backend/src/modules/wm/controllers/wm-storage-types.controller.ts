import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { WmStorageTypesService } from '../services/wm-storage-types.service';
import { CreateStorageTypeDto } from '../dto/create-storage-type.dto';
import { UpdateStorageTypeDto } from '../dto/update-storage-type.dto';

@Controller('wm/storage-types')
export class WmStorageTypesController {
  constructor(private readonly storageTypesService: WmStorageTypesService) {}

  @Post()
  create(@Body() dto: CreateStorageTypeDto) {
    return this.storageTypesService.create(dto);
  }

  @Get()
  findAll(@Query('warehouse_id') warehouseId?: string) {
    return this.storageTypesService.findAll(warehouseId ? Number(warehouseId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storageTypesService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStorageTypeDto) {
    return this.storageTypesService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storageTypesService.remove(Number(id));
  }
}
