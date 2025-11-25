import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { WmTransportOrdersService } from '../services/wm-transport-orders.service';
import { CreateTransportOrderDto } from '../dto/create-transport-order.dto';
import { UpdateTransportOrderStatusDto } from '../dto/update-transport-order-status.dto';
import { TransportOrderStatus } from '../entities/wm-transport-order.entity';

@Controller('wm/transport-orders')
export class WmTransportOrdersController {
  constructor(private readonly transportOrdersService: WmTransportOrdersService) {}

  @Post()
  create(@Body() dto: CreateTransportOrderDto) {
    return this.transportOrdersService.create(dto);
  }

  @Get()
  findAll(@Query('company_id') companyId?: string, @Query('status') status?: TransportOrderStatus) {
    return this.transportOrdersService.findAll({
      companyId: companyId ? Number(companyId) : undefined,
      status,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transportOrdersService.findOne(Number(id));
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTransportOrderStatusDto) {
    return this.transportOrdersService.updateStatus(Number(id), dto);
  }
}
