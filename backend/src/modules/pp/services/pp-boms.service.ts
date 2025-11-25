import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PpBom } from '../entities/pp-bom.entity';
import { PpBomItem } from '../entities/pp-bom-item.entity';
import { CreateBomDto } from '../dto/create-bom.dto';
import { UpdateBomDto } from '../dto/update-bom.dto';
import { Company } from '../../core/entities/company.entity';
import { MmMaterial } from '../../mm/entities/mm-material.entity';

@Injectable()
export class PpBomsService {
  private readonly logger = new Logger(PpBomsService.name);

  constructor(
    @InjectRepository(PpBom)
    private readonly bomsRepository: Repository<PpBom>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(MmMaterial)
    private readonly materialsRepository: Repository<MmMaterial>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateBomDto): Promise<PpBom> {
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const material = await this.materialsRepository.findOne({ where: { id: dto.material_id } });
    if (!material) {
      throw new NotFoundException('Material not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const bom = queryRunner.manager.create(PpBom, {
        company,
        material,
        bomCode: dto.bom_code,
        description: dto.description,
        isActive: true,
      });
      bom.items = [];

      for (const itemDto of dto.items) {
        const componentMaterial = await this.materialsRepository.findOne({ where: { id: itemDto.component_material_id } });
        if (!componentMaterial) {
          throw new NotFoundException(`Component material ${itemDto.component_material_id} not found`);
        }
        const bomItem = queryRunner.manager.create(PpBomItem, {
          bom,
          componentMaterial,
          quantity: itemDto.quantity,
          uom: itemDto.uom,
          scrapPercent: itemDto.scrap_percent ?? 0,
        });
        bom.items.push(bomItem);
      }

      const saved = await queryRunner.manager.save(bom);
      await queryRunner.commitTransaction();
      this.logger.log(`Created BOM ${saved.bomCode} for company ${company.id}`);
      return this.bomsRepository.findOne({ where: { id: saved.id }, relations: ['items'] });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to create BOM', error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(companyId?: number, materialId?: number): Promise<PpBom[]> {
    const where: any = {};
    if (companyId) {
      where.company = { id: companyId } as any;
    }
    if (materialId) {
      where.material = { id: materialId } as any;
    }
    return this.bomsRepository.find({ where, relations: ['items'] });
  }

  async findOne(id: number): Promise<PpBom> {
    const bom = await this.bomsRepository.findOne({ where: { id }, relations: ['items'] });
    if (!bom) {
      this.logger.warn(`BOM ${id} not found`);
      throw new NotFoundException('BOM not found');
    }
    return bom;
  }

  async update(id: number, dto: UpdateBomDto): Promise<PpBom> {
    const bom = await this.findOne(id);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (dto.company_id) {
        const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
        if (!company) {
          throw new NotFoundException('Company not found');
        }
        bom.company = company;
      }
      if (dto.material_id) {
        const material = await this.materialsRepository.findOne({ where: { id: dto.material_id } });
        if (!material) {
          throw new NotFoundException('Material not found');
        }
        bom.material = material;
      }

      bom.bomCode = dto.bom_code ?? bom.bomCode;
      bom.description = dto.description ?? bom.description;

      if (dto.items) {
        await queryRunner.manager.delete(PpBomItem, { bom: { id: bom.id } });
        bom.items = [];
        for (const itemDto of dto.items) {
          const componentMaterial = await this.materialsRepository.findOne({ where: { id: itemDto.component_material_id } });
          if (!componentMaterial) {
            throw new NotFoundException(`Component material ${itemDto.component_material_id} not found`);
          }
          const item = queryRunner.manager.create(PpBomItem, {
            bom,
            componentMaterial,
            quantity: itemDto.quantity,
            uom: itemDto.uom,
            scrapPercent: itemDto.scrap_percent ?? 0,
          });
          bom.items.push(item);
        }
      }

      const saved = await queryRunner.manager.save(bom);
      await queryRunner.commitTransaction();
      this.logger.log(`Updated BOM ${saved.bomCode}`);
      return this.findOne(saved.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to update BOM', error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    const bom = await this.bomsRepository.findOne({ where: { id } });
    if (!bom) {
      this.logger.warn(`BOM ${id} not found`);
      throw new NotFoundException('BOM not found');
    }
    await this.bomsRepository.remove(bom);
    this.logger.log(`Removed BOM ${id}`);
  }
}
