import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { QmCharacteristicsService } from '../services/qm-characteristics.service';
import { CreateCharacteristicDto } from '../dto/create-characteristic.dto';
import { UpdateCharacteristicDto } from '../dto/update-characteristic.dto';

@Controller('qm/characteristics')
export class QmCharacteristicsController {
  constructor(private readonly characteristicsService: QmCharacteristicsService) {}

  @Post()
  create(@Body() dto: CreateCharacteristicDto) {
    return this.characteristicsService.create(dto);
  }

  @Get()
  findAll(@Query('company_id') companyId?: string) {
    return this.characteristicsService.findAll(companyId ? Number(companyId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.characteristicsService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCharacteristicDto) {
    return this.characteristicsService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.characteristicsService.remove(Number(id));
  }
}
