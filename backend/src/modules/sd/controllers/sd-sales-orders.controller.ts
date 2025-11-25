import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { SdSalesOrdersService } from '../services/sd-sales-orders.service';
import { CreateSalesOrderDto } from '../dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from '../dto/update-sales-order.dto';
import { SalesOrderStatus } from '../entities/sd-sales-order.entity';

@Controller('sd/sales-orders')
export class SdSalesOrdersController {
  constructor(private readonly salesOrdersService: SdSalesOrdersService) {}

  @Post()
  create(@Body() dto: CreateSalesOrderDto) {
    return this.salesOrdersService.create(dto);
  }

  @Get()
  findAll(
    @Query('company_id') companyId?: string,
    @Query('customer_id') customerId?: string,
    @Query('status') status?: SalesOrderStatus,
  ) {
    return this.salesOrdersService.findAll({
      company_id: companyId ? Number(companyId) : undefined,
      customer_id: customerId ? Number(customerId) : undefined,
      status,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesOrdersService.findOne(Number(id));
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateSalesOrderDto) {
    return this.salesOrdersService.updateStatus(Number(id), dto.status as SalesOrderStatus.CONFIRMED | SalesOrderStatus.CANCELLED);
  }
}
