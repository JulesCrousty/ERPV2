import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { MmPurchaseRequisitionsService } from '../services/mm-purchase-requisitions.service';
import { CreatePurchaseRequisitionDto } from '../dto/create-purchase-requisition.dto';
import { UpdatePurchaseRequisitionDto } from '../dto/update-purchase-requisition.dto';

@Controller('mm/purchase-requisitions')
export class MmPurchaseRequisitionsController {
  constructor(private readonly requisitionsService: MmPurchaseRequisitionsService) {}

  @Post()
  create(@Body() dto: CreatePurchaseRequisitionDto) {
    return this.requisitionsService.create(dto);
  }

  @Get()
  findAll() {
    return this.requisitionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requisitionsService.findOne(Number(id));
  }

  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.requisitionsService.approve(Number(id));
  }

  @Post(':id/convert-to-po')
  convertToPo(@Param('id') id: string, @Body() body: { vendor_id?: number; currency?: string }) {
    return this.requisitionsService.convertToPurchaseOrder(Number(id), body.vendor_id, body.currency ?? 'USD');
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseRequisitionDto) {
    return this.requisitionsService.update(Number(id), dto);
  }
}
