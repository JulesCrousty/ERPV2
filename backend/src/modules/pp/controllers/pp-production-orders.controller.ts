import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PpProductionOrdersService } from '../services/pp-production-orders.service';
import { CreateProductionOrderDto } from '../dto/create-production-order.dto';
import { UpdateProductionOrderStatusDto } from '../dto/update-production-order-status.dto';
import { ConfirmOperationDto } from '../dto/confirm-operation.dto';
import { PostMaterialConsumptionDto } from '../dto/post-material-consumption.dto';
import { PostFinishedGoodsReceiptDto } from '../dto/post-finished-goods-receipt.dto';

@Controller('pp/production-orders')
export class PpProductionOrdersController {
  constructor(private readonly productionOrdersService: PpProductionOrdersService) {}

  @Post()
  create(@Body() dto: CreateProductionOrderDto) {
    return this.productionOrdersService.create(dto);
  }

  @Get()
  findAll(@Query('company_id') companyId?: string, @Query('material_id') materialId?: string, @Query('status') status?: string) {
    return this.productionOrdersService.findAll({
      company_id: companyId ? Number(companyId) : undefined,
      material_id: materialId ? Number(materialId) : undefined,
      status: status || undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productionOrdersService.findOne(Number(id));
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateProductionOrderStatusDto) {
    return this.productionOrdersService.updateStatus(Number(id), dto);
  }

  @Post('confirm-operation')
  confirmOperation(@Body() dto: ConfirmOperationDto) {
    return this.productionOrdersService.confirmOperation(dto);
  }

  @Post('material-consumption')
  postMaterialConsumption(@Body() dto: PostMaterialConsumptionDto) {
    return this.productionOrdersService.postMaterialConsumption(dto);
  }

  @Post('finished-goods-receipt')
  postFinishedGoodsReceipt(@Body() dto: PostFinishedGoodsReceiptDto) {
    return this.productionOrdersService.postFinishedGoodsReceipt(dto);
  }
}
