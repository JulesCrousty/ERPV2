import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { HrPositionsService } from '../services/hr-positions.service';
import { CreatePositionDto } from '../dto/create-position.dto';
import { UpdatePositionDto } from '../dto/update-position.dto';

@Controller('hr/positions')
export class HrPositionsController {
  constructor(private readonly positionsService: HrPositionsService) {}

  @Post()
  create(@Body() dto: CreatePositionDto) {
    return this.positionsService.create(dto);
  }

  @Get()
  findAll() {
    return this.positionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.positionsService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePositionDto) {
    return this.positionsService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.positionsService.remove(Number(id));
  }
}
