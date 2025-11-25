import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { QmQualityLevel } from '../entities/qm-quality-level.entity';
import { MmMaterial } from '../../mm/entities/mm-material.entity';
import { QmInspectionLot, QMStatus } from '../entities/qm-inspection-lot.entity';

@Injectable()
export class QmQualityLevelsService {
  private readonly logger = new Logger(QmQualityLevelsService.name);

  constructor(
    @InjectRepository(QmQualityLevel)
    private readonly qualityLevelsRepository: Repository<QmQualityLevel>,
    @InjectRepository(MmMaterial)
    private readonly materialsRepository: Repository<MmMaterial>,
    @InjectRepository(QmInspectionLot)
    private readonly inspectionLotsRepository: Repository<QmInspectionLot>,
  ) {}

  async updateQualityLevel(materialId: number, accepted: boolean): Promise<QmQualityLevel> {
    const material = await this.materialsRepository.findOne({ where: { id: materialId }, relations: ['company'] });
    if (!material) {
      throw new NotFoundException('Material not found');
    }

    const lots = await this.inspectionLotsRepository.find({
      where: { material: { id: materialId } as any, status: In([QMStatus.ACCEPTED, QMStatus.REJECTED]) },
      order: { updatedAt: 'DESC' },
      take: 20,
    });

    const totalLots = lots.length;
    const acceptedCount = lots.filter((l) => l.status === QMStatus.ACCEPTED).length;
    const qualityScore = totalLots > 0 ? (acceptedCount / totalLots) * 100 : accepted ? 100 : 0;

    let qualityLevel = await this.qualityLevelsRepository.findOne({
      where: { company: { id: material.company.id }, material: { id: materialId } as any },
    });

    if (!qualityLevel) {
      qualityLevel = this.qualityLevelsRepository.create({
        company: material.company,
        material,
        qualityScore,
      });
    } else {
      qualityLevel.qualityScore = qualityScore;
    }

    const saved = await this.qualityLevelsRepository.save(qualityLevel);
    this.logger.log(`Updated quality level for material ${materialId} to ${qualityScore}`);
    return saved;
  }

  async getByMaterial(materialId: number): Promise<QmQualityLevel | null> {
    return this.qualityLevelsRepository.findOne({ where: { material: { id: materialId } as any } });
  }

  async findAll(companyId?: number): Promise<QmQualityLevel[]> {
    const where: any = {};
    if (companyId) {
      where.company = { id: companyId } as any;
    }
    return this.qualityLevelsRepository.find({ where });
  }
}
