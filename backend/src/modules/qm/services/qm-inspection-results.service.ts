import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QmInspectionResult } from '../entities/qm-inspection-result.entity';
import { CreateInspectionResultDto } from '../dto/create-inspection-result.dto';
import { QmInspectionLot, QMStatus } from '../entities/qm-inspection-lot.entity';
import { QmCharacteristic } from '../entities/qm-characteristic.entity';

@Injectable()
export class QmInspectionResultsService {
  private readonly logger = new Logger(QmInspectionResultsService.name);

  constructor(
    @InjectRepository(QmInspectionResult)
    private readonly inspectionResultsRepository: Repository<QmInspectionResult>,
    @InjectRepository(QmInspectionLot)
    private readonly inspectionLotsRepository: Repository<QmInspectionLot>,
    @InjectRepository(QmCharacteristic)
    private readonly characteristicsRepository: Repository<QmCharacteristic>,
  ) {}

  private calculateOk(measuredValue: number | undefined, characteristic: QmCharacteristic): boolean | null {
    if (
      measuredValue !== undefined &&
      measuredValue !== null &&
      characteristic.lowerLimit !== null &&
      characteristic.lowerLimit !== undefined &&
      characteristic.upperLimit !== null &&
      characteristic.upperLimit !== undefined
    ) {
      return measuredValue >= Number(characteristic.lowerLimit) && measuredValue <= Number(characteristic.upperLimit);
    }
    return null;
  }

  async recordResult(dto: CreateInspectionResultDto): Promise<QmInspectionResult> {
    const lot = await this.inspectionLotsRepository.findOne({ where: { id: dto.inspection_lot_id } });
    if (!lot) {
      throw new NotFoundException('Inspection lot not found');
    }
    if (lot.status !== QMStatus.IN_PROGRESS) {
      this.logger.warn(`Attempted to record result while lot ${lot.id} is in status ${lot.status}`);
      throw new BadRequestException('Inspection lot is not in progress');
    }

    const characteristic = await this.characteristicsRepository.findOne({ where: { id: dto.characteristic_id } });
    if (!characteristic) {
      throw new NotFoundException('Characteristic not found');
    }

    const okValue = this.calculateOk(dto.measured_value, characteristic);
    const result = this.inspectionResultsRepository.create({
      inspectionLot: lot,
      characteristic,
      measuredValue: dto.measured_value ?? null,
      ok: okValue,
      recordedBy: null,
      recordedAt: new Date(),
    });

    const saved = await this.inspectionResultsRepository.save(result);
    this.logger.log(`Recorded result for lot ${lot.id} and characteristic ${characteristic.code}`);

    const totalCharacteristics = await this.characteristicsRepository.count({
      where: { company: { id: lot.company.id }, isActive: true } as any,
    });
    const totalResults = await this.inspectionResultsRepository.count({ where: { inspectionLot: { id: lot.id } as any } });
    if (totalCharacteristics > 0 && totalResults >= totalCharacteristics) {
      lot.status = QMStatus.RESULTS_RECORDED;
      await this.inspectionLotsRepository.save(lot);
      this.logger.log(`All characteristics recorded for lot ${lot.id}, status moved to RESULTS_RECORDED`);
    }

    return saved;
  }
}
