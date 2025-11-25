import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WmStorageBin } from '../entities/wm-storage-bin.entity';
import { CreateStorageBinDto } from '../dto/create-storage-bin.dto';
import { UpdateStorageBinDto } from '../dto/update-storage-bin.dto';
import { WmStorageType } from '../entities/wm-storage-type.entity';

@Injectable()
export class WmStorageBinsService {
  private readonly logger = new Logger(WmStorageBinsService.name);

  constructor(
    @InjectRepository(WmStorageBin)
    private readonly storageBinsRepository: Repository<WmStorageBin>,
    @InjectRepository(WmStorageType)
    private readonly storageTypesRepository: Repository<WmStorageType>,
  ) {}

  async create(dto: CreateStorageBinDto): Promise<WmStorageBin> {
    const storageType = await this.storageTypesRepository.findOne({ where: { id: dto.storage_type_id } });
    if (!storageType) {
      throw new NotFoundException('Storage type not found');
    }

    const existing = await this.storageBinsRepository.findOne({
      where: { storageType: { id: storageType.id }, code: dto.code },
    });
    if (existing) {
      throw new BadRequestException('Storage bin code must be unique per storage type');
    }

    const bin = this.storageBinsRepository.create({ storageType, code: dto.code });
    const saved = await this.storageBinsRepository.save(bin);
    this.logger.log(`Created storage bin ${saved.code} in storage type ${storageType.id}`);
    return saved;
  }

  findAll(storageTypeId?: number): Promise<WmStorageBin[]> {
    if (storageTypeId) {
      return this.storageBinsRepository.find({ where: { storageType: { id: storageTypeId } } });
    }
    return this.storageBinsRepository.find();
  }

  async findOne(id: number): Promise<WmStorageBin> {
    const bin = await this.storageBinsRepository.findOne({ where: { id } });
    if (!bin) {
      throw new NotFoundException('Storage bin not found');
    }
    return bin;
  }

  async update(id: number, dto: UpdateStorageBinDto): Promise<WmStorageBin> {
    const bin = await this.findOne(id);

    if (dto.storage_type_id && dto.storage_type_id !== bin.storageType.id) {
      const storageType = await this.storageTypesRepository.findOne({ where: { id: dto.storage_type_id } });
      if (!storageType) {
        throw new NotFoundException('Storage type not found');
      }
      bin.storageType = storageType;
    }

    if (dto.code && dto.code !== bin.code) {
      const existing = await this.storageBinsRepository.findOne({
        where: { storageType: { id: bin.storageType.id }, code: dto.code },
      });
      if (existing) {
        throw new BadRequestException('Storage bin code must be unique per storage type');
      }
      bin.code = dto.code;
    }

    if (dto.is_blocked !== undefined) {
      bin.isBlocked = dto.is_blocked;
      bin.blockReason = dto.block_reason;
      this.logger.log(`${dto.is_blocked ? 'Blocked' : 'Unblocked'} bin ${bin.code}`);
    } else if (dto.block_reason !== undefined) {
      bin.blockReason = dto.block_reason;
    }

    const saved = await this.storageBinsRepository.save(bin);
    this.logger.log(`Updated storage bin ${saved.code}`);
    return saved;
  }

  async remove(id: number): Promise<void> {
    const bin = await this.findOne(id);
    await this.storageBinsRepository.remove(bin);
  }
}
