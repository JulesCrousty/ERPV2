import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WmWarehouse } from '../entities/wm-warehouse.entity';
import { CreateWarehouseDto } from '../dto/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/update-warehouse.dto';
import { Company } from '../../core/entities/company.entity';

@Injectable()
export class WmWarehousesService {
  private readonly logger = new Logger(WmWarehousesService.name);

  constructor(
    @InjectRepository(WmWarehouse)
    private readonly warehousesRepository: Repository<WmWarehouse>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  async create(dto: CreateWarehouseDto): Promise<WmWarehouse> {
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const existing = await this.warehousesRepository.findOne({ where: { company: { id: company.id }, code: dto.code } });
    if (existing) {
      throw new BadRequestException('Warehouse code must be unique per company');
    }

    const warehouse = this.warehousesRepository.create({
      company,
      code: dto.code,
      name: dto.name,
      description: dto.description,
      isActive: dto.is_active ?? true,
    });
    const saved = await this.warehousesRepository.save(warehouse);
    this.logger.log(`Created warehouse ${saved.code} for company ${company.id}`);
    return saved;
  }

  findAll(companyId?: number): Promise<WmWarehouse[]> {
    if (companyId) {
      return this.warehousesRepository.find({ where: { company: { id: companyId } } });
    }
    return this.warehousesRepository.find();
  }

  async findOne(id: number): Promise<WmWarehouse> {
    const warehouse = await this.warehousesRepository.findOne({ where: { id } });
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }
    return warehouse;
  }

  async update(id: number, dto: UpdateWarehouseDto): Promise<WmWarehouse> {
    const warehouse = await this.findOne(id);

    if (dto.company_id && dto.company_id !== warehouse.company.id) {
      const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
      if (!company) {
        throw new NotFoundException('Company not found');
      }
      warehouse.company = company;
    }

    if (dto.code && dto.code !== warehouse.code) {
      const existing = await this.warehousesRepository.findOne({
        where: { company: { id: warehouse.company.id }, code: dto.code },
      });
      if (existing) {
        throw new BadRequestException('Warehouse code must be unique per company');
      }
      warehouse.code = dto.code;
    }

    warehouse.name = dto.name ?? warehouse.name;
    warehouse.description = dto.description ?? warehouse.description;
    warehouse.isActive = dto.is_active ?? warehouse.isActive;

    const saved = await this.warehousesRepository.save(warehouse);
    this.logger.log(`Updated warehouse ${saved.code}`);
    return saved;
  }

  async remove(id: number): Promise<void> {
    const warehouse = await this.findOne(id);
    await this.warehousesRepository.remove(warehouse);
  }
}
