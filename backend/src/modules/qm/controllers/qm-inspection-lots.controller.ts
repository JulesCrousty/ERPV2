import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { QmInspectionLotsService } from '../services/qm-inspection-lots.service';
import { CreateInspectionLotDto } from '../dto/create-inspection-lot.dto';
import { UpdateInspectionLotStatusDto } from '../dto/update-inspection-lot-status.dto';
import { QMStatus } from '../entities/qm-inspection-lot.entity';

@Controller('qm/inspection-lots')
export class QmInspectionLotsController {
  constructor(private readonly inspectionLotsService: QmInspectionLotsService) {}

  @Post()
  create(@Body() dto: CreateInspectionLotDto) {
    return this.inspectionLotsService.create(dto);
  }

  @Get()
  findAll(
    @Query('company_id') companyId?: string,
    @Query('status') status?: QMStatus,
    @Query('material_id') materialId?: string,
  ) {
    return this.inspectionLotsService.findAll({
      company_id: companyId ? Number(companyId) : undefined,
      status: status as QMStatus,
      material_id: materialId ? Number(materialId) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inspectionLotsService.findOne(Number(id));
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateInspectionLotStatusDto) {
    return this.inspectionLotsService.updateStatus(Number(id), dto);
  }
}
