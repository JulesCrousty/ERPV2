import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MmMaterial } from '../entities/mm-material.entity';
import { CreateMaterialDto } from '../dto/create-material.dto';
import { UpdateMaterialDto } from '../dto/update-material.dto';
import { Company } from '../../core/entities/company.entity';

@Injectable()
export class MmMaterialsService {
  constructor(
    @InjectRepository(MmMaterial)
    private readonly materialsRepository: Repository<MmMaterial>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  async create(dto: CreateMaterialDto): Promise<MmMaterial> {
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const existing = await this.materialsRepository.findOne({
      where: { company: { id: dto.company_id }, materialCode: dto.material_code },
      relations: ['company'],
    });
    if (existing) {
      throw new ConflictException('Material code must be unique within company');
    }

    const material = this.materialsRepository.create({
      company,
      materialCode: dto.material_code,
      name: dto.name,
      description: dto.description,
      materialType: dto.material_type,
      baseUom: dto.base_uom,
      purchasingGroup: dto.purchasing_group,
      valuationClass: dto.valuation_class,
      isActive: dto.is_active ?? true,
    });
    return this.materialsRepository.save(material);
  }

  async findAll(companyId?: number): Promise<MmMaterial[]> {
    if (companyId) {
      return this.materialsRepository.find({ where: { company: { id: companyId } } });
    }
    return this.materialsRepository.find();
  }

  async findOne(id: number): Promise<MmMaterial> {
    const material = await this.materialsRepository.findOne({ where: { id } });
    if (!material) {
      throw new NotFoundException('Material not found');
    }
    return material;
  }

  async update(id: number, dto: UpdateMaterialDto): Promise<MmMaterial> {
    const material = await this.findOne(id);

    if (dto.material_code && dto.material_code !== material.materialCode) {
      const existing = await this.materialsRepository.findOne({
        where: { company: { id: dto.company_id ?? material.company.id }, materialCode: dto.material_code },
      });
      if (existing) {
        throw new ConflictException('Material code must be unique within company');
      }
    }

    if (dto.company_id && dto.company_id !== material.company.id) {
      const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
      if (!company) {
        throw new NotFoundException('Company not found');
      }
      material.company = company;
    }

    Object.assign(material, {
      materialCode: dto.material_code ?? material.materialCode,
      name: dto.name ?? material.name,
      description: dto.description ?? material.description,
      materialType: dto.material_type ?? material.materialType,
      baseUom: dto.base_uom ?? material.baseUom,
      purchasingGroup: dto.purchasing_group ?? material.purchasingGroup,
      valuationClass: dto.valuation_class ?? material.valuationClass,
      isActive: dto.is_active ?? material.isActive,
    });

    return this.materialsRepository.save(material);
  }

  async remove(id: number): Promise<void> {
    const material = await this.findOne(id);
    await this.materialsRepository.remove(material);
  }
}
