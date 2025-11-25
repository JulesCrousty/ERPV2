import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { MmPurchaseOrdersService } from '../services/mm-purchase-orders.service';
import { CreatePurchaseOrderDto } from '../dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from '../dto/update-purchase-order.dto';
import { PurchaseOrderStatus } from '../entities/mm-purchase-order.entity';

@Controller('mm/purchase-orders')
export class MmPurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: MmPurchaseOrdersService) {}

  @Post()
  create(@Body() dto: CreatePurchaseOrderDto) {
    return this.purchaseOrdersService.create(dto);
  }

  @Get()
  findAll(
    @Query('company_id') companyId?: string,
    @Query('vendor_id') vendorId?: string,
    @Query('status') status?: PurchaseOrderStatus,
  ) {
    return this.purchaseOrdersService.findAll({
      companyId: companyId ? Number(companyId) : undefined,
      vendorId: vendorId ? Number(vendorId) : undefined,
      status,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseOrdersService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto) {
    return this.purchaseOrdersService.update(Number(id), dto);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.purchaseOrdersService.changeStatus(Number(id), PurchaseOrderStatus.APPROVED);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.purchaseOrdersService.changeStatus(Number(id), PurchaseOrderStatus.CANCELLED);
  }
}
