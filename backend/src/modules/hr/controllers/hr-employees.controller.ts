import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { HrEmployeesService } from '../services/hr-employees.service';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';

@Controller('hr/employees')
export class HrEmployeesController {
  constructor(private readonly employeesService: HrEmployeesService) {}

  @Post()
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto);
  }

  @Get()
  findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeesService.update(Number(id), dto);
  }

  @Delete(':id')
  deactivate(@Param('id') id: string) {
    return this.employeesService.remove(Number(id));
  }
}
