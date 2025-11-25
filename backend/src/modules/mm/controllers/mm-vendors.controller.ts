import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { MmVendorsService } from '../services/mm-vendors.service';
import { CreateVendorDto } from '../dto/create-vendor.dto';
import { UpdateVendorDto } from '../dto/update-vendor.dto';

@Controller('mm/vendors')
export class MmVendorsController {
  constructor(private readonly vendorsService: MmVendorsService) {}

  @Post()
  create(@Body() dto: CreateVendorDto) {
    return this.vendorsService.create(dto);
  }

  @Get()
  findAll(@Query('company_id') companyId?: string) {
    return this.vendorsService.findAll(companyId ? Number(companyId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVendorDto) {
    return this.vendorsService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vendorsService.remove(Number(id));
  }
}
