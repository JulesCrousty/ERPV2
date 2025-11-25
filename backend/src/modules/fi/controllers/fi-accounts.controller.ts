import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CreateFiAccountDto } from '../dto/create-fi-account.dto';
import { UpdateFiAccountDto } from '../dto/update-fi-account.dto';
import { FiAccountsService } from '../services/fi-accounts.service';

@Controller('fi/accounts')
export class FiAccountsController {
  constructor(private readonly fiAccountsService: FiAccountsService) {}

  @Post()
  create(@Body() dto: CreateFiAccountDto) {
    return this.fiAccountsService.create(dto);
  }

  @Get()
  findAll(@Query('company_id') companyId?: string) {
    return this.fiAccountsService.findAll(companyId ? Number(companyId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fiAccountsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFiAccountDto) {
    return this.fiAccountsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fiAccountsService.remove(id);
  }
}
