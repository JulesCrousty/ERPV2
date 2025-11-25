import { Controller, Get, Param, Query } from '@nestjs/common';
import { QmQualityLevelsService } from '../services/qm-quality-levels.service';

@Controller('qm/quality-levels')
export class QmQualityLevelsController {
  constructor(private readonly qualityLevelsService: QmQualityLevelsService) {}

  @Get()
  findAll(@Query('company_id') companyId?: string) {
    return this.qualityLevelsService.findAll(companyId ? Number(companyId) : undefined);
  }

  @Get('material/:materialId')
  getByMaterial(@Param('materialId') materialId: string) {
    return this.qualityLevelsService.getByMaterial(Number(materialId));
  }
}
