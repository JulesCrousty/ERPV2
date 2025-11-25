import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { FiscalPeriodService } from './fiscal-period.service';
import { CreateFiscalPeriodDto } from './dto/create-fiscal-period.dto';
import { UpdateFiscalPeriodDto } from './dto/update-fiscal-period.dto';

@Controller('fiscal-period')
export class FiscalPeriodController {
  constructor(private readonly fiscalPeriodService: FiscalPeriodService) {}

  @Post()
  create(@Body() createFiscalPeriodDto: CreateFiscalPeriodDto) {
    return this.fiscalPeriodService.create(createFiscalPeriodDto);
  }

  @Get()
  findAll() {
    return this.fiscalPeriodService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fiscalPeriodService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateFiscalPeriodDto: UpdateFiscalPeriodDto) {
    return this.fiscalPeriodService.update(id, updateFiscalPeriodDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fiscalPeriodService.remove(id);
  }
}
