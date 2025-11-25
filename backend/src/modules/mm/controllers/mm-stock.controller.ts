import { Controller, Get, Query } from '@nestjs/common';
import { MmStockService } from '../services/mm-stock.service';

@Controller('mm/stock')
export class MmStockController {
  constructor(private readonly stockService: MmStockService) {}

  @Get()
  findAll(
    @Query('company_id') companyId: string,
    @Query('material_id') materialId?: string,
    @Query('storage_location_code') storageLocationCode?: string,
  ) {
    return this.stockService.getStock(
      Number(companyId),
      materialId ? Number(materialId) : undefined,
      storageLocationCode,
    );
  }
}
