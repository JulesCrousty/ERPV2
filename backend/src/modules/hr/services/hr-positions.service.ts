import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HrPosition } from '../entities/hr-position.entity';
import { HrDepartment } from '../entities/hr-department.entity';
import { CreatePositionDto } from '../dto/create-position.dto';
import { UpdatePositionDto } from '../dto/update-position.dto';
import { Company } from '../../core/entities/company.entity';

@Injectable()
export class HrPositionsService {
  private readonly logger = new Logger(HrPositionsService.name);

  constructor(
    @InjectRepository(HrPosition)
    private readonly positionsRepository: Repository<HrPosition>,
    @InjectRepository(HrDepartment)
    private readonly departmentsRepository: Repository<HrDepartment>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  async create(dto: CreatePositionDto): Promise<HrPosition> {
    this.logger.log(`Creating position ${dto.code}`);
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const department = await this.departmentsRepository.findOne({ where: { id: dto.department_id } });
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const position = this.positionsRepository.create({
      company,
      department,
      code: dto.code,
      title: dto.title,
      description: dto.description,
    });
    return this.positionsRepository.save(position);
  }

  findAll(): Promise<HrPosition[]> {
    return this.positionsRepository.find();
  }

  async findOne(id: number): Promise<HrPosition> {
    const position = await this.positionsRepository.findOne({ where: { id } });
    if (!position) {
      throw new NotFoundException('Position not found');
    }
    return position;
  }

  async update(id: number, dto: UpdatePositionDto): Promise<HrPosition> {
    const position = await this.findOne(id);
    this.logger.log(`Updating position ${id}`);
    if (dto.department_id) {
      const department = await this.departmentsRepository.findOne({ where: { id: dto.department_id } });
      if (!department) {
        throw new NotFoundException('Department not found');
      }
      position.department = department;
    }
    Object.assign(position, {
      title: dto.title ?? position.title,
      description: dto.description ?? position.description,
    });
    return this.positionsRepository.save(position);
  }

  async remove(id: number): Promise<void> {
    const position = await this.findOne(id);
    this.logger.log(`Removing position ${id}`);
    await this.positionsRepository.remove(position);
  }
}
