import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateBinMovementDto } from '../dto/create-bin-movement.dto';
import { WmBinStock } from '../entities/wm-bin-stock.entity';
import { WmStorageBin } from '../entities/wm-storage-bin.entity';
import { MmMaterial } from '../../mm/entities/mm-material.entity';
import { MmStock } from '../../mm/entities/mm-stock.entity';
import { Company } from '../../core/entities/company.entity';

@Injectable()
export class WmBinMovementsService {
  private readonly logger = new Logger(WmBinMovementsService.name);

  constructor(
    @InjectRepository(WmStorageBin)
    private readonly storageBinsRepository: Repository<WmStorageBin>,
    @InjectRepository(MmMaterial)
    private readonly materialsRepository: Repository<MmMaterial>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    private readonly dataSource: DataSource,
  ) {}

  async moveStock(dto: CreateBinMovementDto): Promise<void> {
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const material = await this.materialsRepository.findOne({ where: { id: dto.material_id } });
    if (!material) {
      throw new NotFoundException('Material not found');
    }

    const sourceBin = await this.storageBinsRepository.findOne({ where: { id: dto.source_bin_id } });
    const destinationBin = await this.storageBinsRepository.findOne({ where: { id: dto.destination_bin_id } });

    if (!sourceBin || !destinationBin) {
      throw new NotFoundException('Source or destination bin not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sourceStock = await queryRunner.manager.findOne(WmBinStock, {
        where: { bin: { id: sourceBin.id }, material: { id: material.id } },
        relations: ['bin', 'material'],
      });

      if (!sourceStock || Number(sourceStock.quantity) < dto.quantity) {
        this.logger.warn(`Insufficient stock in bin ${sourceBin.id} for material ${material.id}`);
        throw new BadRequestException('Insufficient stock in source bin');
      }

      sourceStock.quantity = Number(sourceStock.quantity) - dto.quantity;
      sourceStock.uom = dto.uom;
      await queryRunner.manager.save(sourceStock);

      let destinationStock = await queryRunner.manager.findOne(WmBinStock, {
        where: { bin: { id: destinationBin.id }, material: { id: material.id } },
        relations: ['bin', 'material'],
      });

      if (!destinationStock) {
        destinationStock = queryRunner.manager.create(WmBinStock, {
          bin: destinationBin,
          material,
          quantity: 0,
          uom: dto.uom,
        });
      }

      destinationStock.quantity = Number(destinationStock.quantity) + dto.quantity;
      destinationStock.uom = dto.uom;
      await queryRunner.manager.save(destinationStock);

      await this.updateMaterialStock(queryRunner.manager, company, material, sourceBin.code, -dto.quantity);
      await this.updateMaterialStock(queryRunner.manager, company, material, destinationBin.code, dto.quantity);

      await queryRunner.commitTransaction();
      this.logger.log(
        `Moved ${dto.quantity} ${dto.uom} of material ${material.id} from bin ${sourceBin.id} to bin ${destinationBin.id}`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error during bin movement', error instanceof Error ? error.stack : undefined);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async updateMaterialStock(
    manager: EntityManager,
    company: Company,
    material: MmMaterial,
    storageLocationCode: string,
    quantityChange: number,
  ): Promise<void> {
    let mmStock = await manager.findOne(MmStock, {
      where: { company: { id: company.id }, material: { id: material.id }, storageLocationCode },
    });

    if (!mmStock && quantityChange < 0) {
      this.logger.warn(`No MM stock to decrement for material ${material.id} at location ${storageLocationCode}`);
      throw new BadRequestException('Insufficient MM stock');
    }

    if (!mmStock) {
      mmStock = manager.create(MmStock, {
        company,
        material,
        storageLocationCode,
        quantity: 0,
        currency: 'USD',
        totalValue: 0,
        lastMovementAt: new Date(),
      });
    }

    const newQuantity = Number(mmStock.quantity) + quantityChange;
    if (newQuantity < 0) {
      this.logger.warn(`Insufficient MM stock for material ${material.id} at location ${storageLocationCode}`);
      throw new BadRequestException('Insufficient MM stock');
    }

    mmStock.quantity = newQuantity;
    mmStock.currency = mmStock.currency || 'USD';
    mmStock.lastMovementAt = new Date();
    mmStock.storageLocationCode = storageLocationCode;
    await manager.save(MmStock, mmStock);
  }
}
