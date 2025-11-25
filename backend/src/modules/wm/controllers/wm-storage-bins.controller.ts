import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { WmStorageBinsService } from '../services/wm-storage-bins.service';
import { CreateStorageBinDto } from '../dto/create-storage-bin.dto';
import { UpdateStorageBinDto } from '../dto/update-storage-bin.dto';

@Controller('wm/storage-bins')
export class WmStorageBinsController {
  constructor(private readonly storageBinsService: WmStorageBinsService) {}

  @Post()
  create(@Body() dto: CreateStorageBinDto) {
    return this.storageBinsService.create(dto);
  }

  @Get()
  findAll(@Query('storage_type_id') storageTypeId?: string) {
    return this.storageBinsService.findAll(storageTypeId ? Number(storageTypeId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storageBinsService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStorageBinDto) {
    return this.storageBinsService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storageBinsService.remove(Number(id));
  }
}
