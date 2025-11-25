import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WmStorageType } from '../entities/wm-storage-type.entity';
import { CreateStorageTypeDto } from '../dto/create-storage-type.dto';
import { UpdateStorageTypeDto } from '../dto/update-storage-type.dto';
import { WmWarehouse } from '../entities/wm-warehouse.entity';

@Injectable()
export class WmStorageTypesService {
  private readonly logger = new Logger(WmStorageTypesService.name);

  constructor(
    @InjectRepository(WmStorageType)
    private readonly storageTypesRepository: Repository<WmStorageType>,
    @InjectRepository(WmWarehouse)
    private readonly warehousesRepository: Repository<WmWarehouse>,
  ) {}

  async create(dto: CreateStorageTypeDto): Promise<WmStorageType> {
    const warehouse = await this.warehousesRepository.findOne({ where: { id: dto.warehouse_id } });
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    const existing = await this.storageTypesRepository.findOne({
      where: { warehouse: { id: warehouse.id }, code: dto.code },
    });
    if (existing) {
      throw new BadRequestException('Storage type code must be unique per warehouse');
    }

    const storageType = this.storageTypesRepository.create({
      warehouse,
      code: dto.code,
      name: dto.name,
      putawayStrategy: dto.putaway_strategy,
      pickingStrategy: dto.picking_strategy,
    });
    const saved = await this.storageTypesRepository.save(storageType);
    this.logger.log(`Created storage type ${saved.code} for warehouse ${warehouse.id}`);
    return saved;
  }

  findAll(warehouseId?: number): Promise<WmStorageType[]> {
    if (warehouseId) {
      return this.storageTypesRepository.find({ where: { warehouse: { id: warehouseId } } });
    }
    return this.storageTypesRepository.find();
  }

  async findOne(id: number): Promise<WmStorageType> {
    const storageType = await this.storageTypesRepository.findOne({ where: { id } });
    if (!storageType) {
      throw new NotFoundException('Storage type not found');
    }
    return storageType;
  }

  async update(id: number, dto: UpdateStorageTypeDto): Promise<WmStorageType> {
    const storageType = await this.findOne(id);

    if (dto.warehouse_id && dto.warehouse_id !== storageType.warehouse.id) {
      const warehouse = await this.warehousesRepository.findOne({ where: { id: dto.warehouse_id } });
      if (!warehouse) {
        throw new NotFoundException('Warehouse not found');
      }
      storageType.warehouse = warehouse;
    }

    if (dto.code && dto.code !== storageType.code) {
      const existing = await this.storageTypesRepository.findOne({
        where: { warehouse: { id: storageType.warehouse.id }, code: dto.code },
      });
      if (existing) {
        throw new BadRequestException('Storage type code must be unique per warehouse');
      }
      storageType.code = dto.code;
    }

    storageType.name = dto.name ?? storageType.name;
    storageType.putawayStrategy = dto.putaway_strategy ?? storageType.putawayStrategy;
    storageType.pickingStrategy = dto.picking_strategy ?? storageType.pickingStrategy;

    const saved = await this.storageTypesRepository.save(storageType);
    this.logger.log(`Updated storage type ${saved.code}`);
    return saved;
  }

  async remove(id: number): Promise<void> {
    const storageType = await this.findOne(id);
    await this.storageTypesRepository.remove(storageType);
  }
}
