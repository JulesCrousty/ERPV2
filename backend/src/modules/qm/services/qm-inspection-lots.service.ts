import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QmInspectionLot, QMStatus } from '../entities/qm-inspection-lot.entity';
import { CreateInspectionLotDto } from '../dto/create-inspection-lot.dto';
import { UpdateInspectionLotStatusDto } from '../dto/update-inspection-lot-status.dto';
import { Company } from '../../core/entities/company.entity';
import { MmMaterial } from '../../mm/entities/mm-material.entity';

@Injectable()
export class QmInspectionLotsService {
  private readonly logger = new Logger(QmInspectionLotsService.name);

  constructor(
    @InjectRepository(QmInspectionLot)
    private readonly inspectionLotsRepository: Repository<QmInspectionLot>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(MmMaterial)
    private readonly materialsRepository: Repository<MmMaterial>,
  ) {}

  private generateLotNumber(companyId: number): string {
    return `LOT-${companyId}-${Date.now()}`;
  }

  async create(dto: CreateInspectionLotDto): Promise<QmInspectionLot> {
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const material = await this.materialsRepository.findOne({ where: { id: dto.material_id } });
    if (!material) {
      throw new NotFoundException('Material not found');
    }

    const lot = this.inspectionLotsRepository.create({
      company,
      material,
      lotNumber: this.generateLotNumber(company.id),
      referenceType: dto.reference_type,
      referenceId: dto.reference_id ?? null,
      quantity: dto.quantity,
      uom: dto.uom,
      status: QMStatus.CREATED,
      createdBy: null,
    });

    const saved = await this.inspectionLotsRepository.save(lot);
    this.logger.log(`Created inspection lot ${saved.lotNumber} for company ${company.id}`);
    return saved;
  }

  async findAll(filters?: { company_id?: number; status?: QMStatus; material_id?: number }): Promise<QmInspectionLot[]> {
    const where: any = {};
    if (filters?.company_id) {
      where.company = { id: filters.company_id } as any;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.material_id) {
      where.material = { id: filters.material_id } as any;
    }
    return this.inspectionLotsRepository.find({ where });
  }

  async findOne(id: number): Promise<QmInspectionLot> {
    const lot = await this.inspectionLotsRepository.findOne({ where: { id } });
    if (!lot) {
      throw new NotFoundException('Inspection lot not found');
    }
    return lot;
  }

  async updateStatus(id: number, dto: UpdateInspectionLotStatusDto): Promise<QmInspectionLot> {
    const lot = await this.findOne(id);
    const allowedTransitions: Record<QMStatus, QMStatus[]> = {
      [QMStatus.CREATED]: [QMStatus.IN_PROGRESS],
      [QMStatus.IN_PROGRESS]: [QMStatus.RESULTS_RECORDED],
      [QMStatus.RESULTS_RECORDED]: [QMStatus.UD_PENDING],
      [QMStatus.UD_PENDING]: [QMStatus.ACCEPTED, QMStatus.REJECTED],
      [QMStatus.ACCEPTED]: [QMStatus.CLOSED],
      [QMStatus.REJECTED]: [QMStatus.CLOSED],
      [QMStatus.CLOSED]: [],
    };

    if (!allowedTransitions[lot.status].includes(dto.status)) {
      this.logger.warn(`Invalid status transition from ${lot.status} to ${dto.status}`);
      throw new BadRequestException('Invalid status transition');
    }

    lot.status = dto.status;
    const saved = await this.inspectionLotsRepository.save(lot);
    this.logger.log(`Updated inspection lot ${lot.lotNumber} to status ${dto.status}`);
    return saved;
  }
}
