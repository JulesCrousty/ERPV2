import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PpWorkCenter } from '../entities/pp-work-center.entity';
import { CreateWorkCenterDto } from '../dto/create-work-center.dto';
import { UpdateWorkCenterDto } from '../dto/update-work-center.dto';
import { Company } from '../../core/entities/company.entity';

@Injectable()
export class PpWorkCentersService {
  private readonly logger = new Logger(PpWorkCentersService.name);

  constructor(
    @InjectRepository(PpWorkCenter)
    private readonly workCentersRepository: Repository<PpWorkCenter>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  async create(dto: CreateWorkCenterDto): Promise<PpWorkCenter> {
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const workCenter = this.workCentersRepository.create({
      company,
      code: dto.code,
      name: dto.name,
      description: dto.description,
      capacityPerHour: dto.capacity_per_hour,
      costPerHour: dto.cost_per_hour,
      isActive: dto.is_active ?? true,
    });

    const saved = await this.workCentersRepository.save(workCenter);
    this.logger.log(`Created work center ${saved.code} for company ${company.id}`);
    return saved;
  }

  async findAll(companyId?: number): Promise<PpWorkCenter[]> {
    const where = companyId ? { company: { id: companyId } } : {};
    return this.workCentersRepository.find({ where });
  }

  async findOne(id: number): Promise<PpWorkCenter> {
    const workCenter = await this.workCentersRepository.findOne({ where: { id } });
    if (!workCenter) {
      throw new NotFoundException('Work center not found');
    }
    return workCenter;
  }

  async update(id: number, dto: UpdateWorkCenterDto): Promise<PpWorkCenter> {
    const workCenter = await this.findOne(id);
    Object.assign(workCenter, {
      code: dto.code ?? workCenter.code,
      name: dto.name ?? workCenter.name,
      description: dto.description ?? workCenter.description,
      capacityPerHour: dto.capacity_per_hour ?? workCenter.capacityPerHour,
      costPerHour: dto.cost_per_hour ?? workCenter.costPerHour,
      isActive: dto.is_active ?? workCenter.isActive,
    });
    const saved = await this.workCentersRepository.save(workCenter);
    this.logger.log(`Updated work center ${saved.code}`);
    return saved;
  }

  async remove(id: number): Promise<void> {
    const workCenter = await this.findOne(id);
    await this.workCentersRepository.remove(workCenter);
    this.logger.log(`Removed work center ${workCenter.code}`);
  }
}
