import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HrDepartment } from '../entities/hr-department.entity';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { Company } from '../../core/entities/company.entity';

@Injectable()
export class HrDepartmentsService {
  private readonly logger = new Logger(HrDepartmentsService.name);

  constructor(
    @InjectRepository(HrDepartment)
    private readonly departmentsRepository: Repository<HrDepartment>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  async create(dto: CreateDepartmentDto): Promise<HrDepartment> {
    this.logger.log(`Creating department ${dto.code}`);
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const department = this.departmentsRepository.create({
      company,
      code: dto.code,
      name: dto.name,
      description: dto.description,
    });
    return this.departmentsRepository.save(department);
  }

  findAll(): Promise<HrDepartment[]> {
    return this.departmentsRepository.find();
  }

  async findOne(id: number): Promise<HrDepartment> {
    const dept = await this.departmentsRepository.findOne({ where: { id } });
    if (!dept) {
      throw new NotFoundException('Department not found');
    }
    return dept;
  }

  async update(id: number, dto: UpdateDepartmentDto): Promise<HrDepartment> {
    const dept = await this.findOne(id);
    this.logger.log(`Updating department ${id}`);
    Object.assign(dept, {
      name: dto.name ?? dept.name,
      description: dto.description ?? dept.description,
    });
    return this.departmentsRepository.save(dept);
  }

  async remove(id: number): Promise<void> {
    const dept = await this.findOne(id);
    this.logger.log(`Removing department ${id}`);
    await this.departmentsRepository.remove(dept);
  }
}
