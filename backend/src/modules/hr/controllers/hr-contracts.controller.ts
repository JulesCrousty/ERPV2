import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { HrContractsService } from '../services/hr-contracts.service';
import { CreateContractDto } from '../dto/create-contract.dto';

@Controller('hr/contracts')
export class HrContractsController {
  constructor(private readonly contractsService: HrContractsService) {}

  @Post()
  create(@Body() dto: CreateContractDto) {
    return this.contractsService.create(dto);
  }

  @Get()
  findAll() {
    return this.contractsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractsService.findAll().then((contracts) => contracts.find((c) => c.id === Number(id)));
  }
}
