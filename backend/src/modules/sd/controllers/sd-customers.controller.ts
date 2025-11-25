import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { SdCustomersService } from '../services/sd-customers.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';

@Controller('sd/customers')
export class SdCustomersController {
  constructor(private readonly customersService: SdCustomersService) {}

  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Get()
  findAll(@Query('company_id') companyId?: string) {
    return this.customersService.findAll(companyId ? Number(companyId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customersService.remove(Number(id));
  }
}
