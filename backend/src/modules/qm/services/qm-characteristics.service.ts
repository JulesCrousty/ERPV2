import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QmCharacteristic } from '../entities/qm-characteristic.entity';
import { CreateCharacteristicDto } from '../dto/create-characteristic.dto';
import { UpdateCharacteristicDto } from '../dto/update-characteristic.dto';
import { Company } from '../../core/entities/company.entity';

@Injectable()
export class QmCharacteristicsService {
  private readonly logger = new Logger(QmCharacteristicsService.name);

  constructor(
    @InjectRepository(QmCharacteristic)
    private readonly characteristicsRepository: Repository<QmCharacteristic>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  async create(dto: CreateCharacteristicDto): Promise<QmCharacteristic> {
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const characteristic = this.characteristicsRepository.create({
      company,
      code: dto.code,
      description: dto.description,
      lowerLimit: dto.lower_limit ?? null,
      upperLimit: dto.upper_limit ?? null,
      targetValue: dto.target_value ?? null,
      uom: dto.uom,
      isActive: dto.is_active ?? true,
    });
    const saved = await this.characteristicsRepository.save(characteristic);
    this.logger.log(`Created characteristic ${saved.code} for company ${company.id}`);
    return saved;
  }

  async findAll(companyId?: number): Promise<QmCharacteristic[]> {
    const where: any = {};
    if (companyId) {
      where.company = { id: companyId } as any;
    }
    return this.characteristicsRepository.find({ where });
  }

  async findOne(id: number): Promise<QmCharacteristic> {
    const characteristic = await this.characteristicsRepository.findOne({ where: { id } });
    if (!characteristic) {
      throw new NotFoundException('Characteristic not found');
    }
    return characteristic;
  }

  async update(id: number, dto: UpdateCharacteristicDto): Promise<QmCharacteristic> {
    const characteristic = await this.findOne(id);
    if (dto.company_id) {
      const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
      if (!company) {
        throw new NotFoundException('Company not found');
      }
      characteristic.company = company;
    }
    characteristic.code = dto.code ?? characteristic.code;
    characteristic.description = dto.description ?? characteristic.description;
    characteristic.lowerLimit = dto.lower_limit ?? characteristic.lowerLimit;
    characteristic.upperLimit = dto.upper_limit ?? characteristic.upperLimit;
    characteristic.targetValue = dto.target_value ?? characteristic.targetValue;
    characteristic.uom = dto.uom ?? characteristic.uom;
    if (dto.is_active !== undefined) {
      characteristic.isActive = dto.is_active;
    }

    const saved = await this.characteristicsRepository.save(characteristic);
    this.logger.log(`Updated characteristic ${saved.code}`);
    return saved;
  }

  async remove(id: number): Promise<void> {
    const characteristic = await this.findOne(id);
    await this.characteristicsRepository.remove(characteristic);
    this.logger.log(`Removed characteristic ${characteristic.code}`);
  }
}
