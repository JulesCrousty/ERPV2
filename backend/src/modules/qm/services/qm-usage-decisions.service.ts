import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QmUsageDecision, QmDecisionType } from '../entities/qm-usage-decision.entity';
import { CreateUsageDecisionDto } from '../dto/create-usage-decision.dto';
import { QmInspectionLot, QMStatus } from '../entities/qm-inspection-lot.entity';
import { QmQualityLevelsService } from './qm-quality-levels.service';

@Injectable()
export class QmUsageDecisionsService {
  private readonly logger = new Logger(QmUsageDecisionsService.name);

  constructor(
    @InjectRepository(QmUsageDecision)
    private readonly usageDecisionsRepository: Repository<QmUsageDecision>,
    @InjectRepository(QmInspectionLot)
    private readonly inspectionLotsRepository: Repository<QmInspectionLot>,
    private readonly qualityLevelsService: QmQualityLevelsService,
  ) {}

  async setDecision(dto: CreateUsageDecisionDto): Promise<QmUsageDecision> {
    const lot = await this.inspectionLotsRepository.findOne({ where: { id: dto.inspection_lot_id } });
    if (!lot) {
      throw new NotFoundException('Inspection lot not found');
    }

    if (lot.status !== QMStatus.UD_PENDING) {
      this.logger.warn(`Usage decision attempted while lot ${lot.id} is in status ${lot.status}`);
      throw new BadRequestException('Inspection lot not ready for usage decision');
    }

    const decision = this.usageDecisionsRepository.create({
      inspectionLot: lot,
      decision: dto.decision,
      comments: dto.comments ?? null,
      decidedBy: null,
      decidedAt: new Date(),
    });

    const saved = await this.usageDecisionsRepository.save(decision);

    lot.status = dto.decision === QmDecisionType.ACCEPT ? QMStatus.ACCEPTED : QMStatus.REJECTED;
    await this.inspectionLotsRepository.save(lot);
    this.logger.log(`Usage decision ${dto.decision} set for lot ${lot.id}`);

    await this.qualityLevelsService.updateQualityLevel(lot.material.id, dto.decision === QmDecisionType.ACCEPT);

    return saved;
  }
}
