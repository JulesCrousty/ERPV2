import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { FiscalYearService } from './fiscal-year.service';
import { CreateFiscalYearDto } from './dto/create-fiscal-year.dto';
import { UpdateFiscalYearDto } from './dto/update-fiscal-year.dto';

@Controller('fiscal-year')
export class FiscalYearController {
  constructor(private readonly fiscalYearService: FiscalYearService) {}

  @Post()
  create(@Body() createFiscalYearDto: CreateFiscalYearDto) {
    return this.fiscalYearService.create(createFiscalYearDto);
  }

  @Get()
  findAll() {
    return this.fiscalYearService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fiscalYearService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateFiscalYearDto: UpdateFiscalYearDto) {
    return this.fiscalYearService.update(id, updateFiscalYearDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fiscalYearService.remove(id);
  }
}
