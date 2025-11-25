import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PpRouting } from '../entities/pp-routing.entity';
import { CreateRoutingDto } from '../dto/create-routing.dto';
import { UpdateRoutingDto } from '../dto/update-routing.dto';
import { Company } from '../../core/entities/company.entity';
import { MmMaterial } from '../../mm/entities/mm-material.entity';
import { PpWorkCenter } from '../entities/pp-work-center.entity';

@Injectable()
export class PpRoutingsService {
  private readonly logger = new Logger(PpRoutingsService.name);

  constructor(
    @InjectRepository(PpRouting)
    private readonly routingsRepository: Repository<PpRouting>,
    @InjectRepository(PpWorkCenter)
    private readonly workCentersRepository: Repository<PpWorkCenter>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(MmMaterial)
    private readonly materialsRepository: Repository<MmMaterial>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateRoutingDto): Promise<PpRouting> {
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
      const routing = queryRunner.manager.create(PpRouting, {
        company,
        material,
        routingCode: dto.routing_code,
        description: dto.description,
        isActive: true,
      });
      routing.operations = [];

      for (const opDto of dto.operations) {
        const workCenter = await this.workCentersRepository.findOne({ where: { id: opDto.work_center_id } });
        if (!workCenter) {
          throw new NotFoundException(`Work center ${opDto.work_center_id} not found`);
        }
        const operation = queryRunner.manager.create(PpRoutingOperation, {
          routing,
          operationNumber: opDto.operation_number,
          workCenter,
          description: opDto.description,
          setupTimeHours: opDto.setup_time_hours,
          processingTimeHours: opDto.processing_time_hours,
          moveTimeHours: opDto.move_time_hours,
          queueTimeHours: opDto.queue_time_hours,
          sequence: opDto.sequence ?? opDto.operation_number,
        });
        routing.operations.push(operation);
      }

      const saved = await queryRunner.manager.save(routing);
      await queryRunner.commitTransaction();
      this.logger.log(`Created routing ${saved.routingCode} for company ${company.id}`);
      return this.routingsRepository.findOne({ where: { id: saved.id }, relations: ['operations'] });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to create routing', error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(companyId?: number, materialId?: number): Promise<PpRouting[]> {
    const where: any = {};
    if (companyId) {
      where.company = { id: companyId } as any;
    }
    if (materialId) {
      where.material = { id: materialId } as any;
    }
    return this.routingsRepository.find({ where, relations: ['operations'] });
  }

  async findOne(id: number): Promise<PpRouting> {
    const routing = await this.routingsRepository.findOne({ where: { id }, relations: ['operations'] });
    if (!routing) {
      this.logger.warn(`Routing ${id} not found`);
      throw new NotFoundException('Routing not found');
    }
    return routing;
  }

  async update(id: number, dto: UpdateRoutingDto): Promise<PpRouting> {
    const routing = await this.findOne(id);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (dto.company_id) {
        const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
        if (!company) {
          throw new NotFoundException('Company not found');
        }
        routing.company = company;
      }
      if (dto.material_id) {
        const material = await this.materialsRepository.findOne({ where: { id: dto.material_id } });
        if (!material) {
          throw new NotFoundException('Material not found');
        }
        routing.material = material;
      }

      routing.routingCode = dto.routing_code ?? routing.routingCode;
      routing.description = dto.description ?? routing.description;

      if (dto.operations) {
        await queryRunner.manager.delete(PpRoutingOperation, { routing: { id: routing.id } });
        routing.operations = [];
        for (const opDto of dto.operations) {
          const workCenter = await this.workCentersRepository.findOne({ where: { id: opDto.work_center_id } });
          if (!workCenter) {
            throw new NotFoundException(`Work center ${opDto.work_center_id} not found`);
          }
          const op = queryRunner.manager.create(PpRoutingOperation, {
            routing,
            operationNumber: opDto.operation_number,
            workCenter,
            description: opDto.description,
            setupTimeHours: opDto.setup_time_hours,
            processingTimeHours: opDto.processing_time_hours,
            moveTimeHours: opDto.move_time_hours,
            queueTimeHours: opDto.queue_time_hours,
            sequence: opDto.sequence ?? opDto.operation_number,
          });
          routing.operations.push(op);
        }
      }

      const saved = await queryRunner.manager.save(routing);
      await queryRunner.commitTransaction();
      this.logger.log(`Updated routing ${saved.routingCode}`);
      return this.findOne(saved.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to update routing', error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    const routing = await this.routingsRepository.findOne({ where: { id } });
    if (!routing) {
      this.logger.warn(`Routing ${id} not found`);
      throw new NotFoundException('Routing not found');
    }
    await this.routingsRepository.remove(routing);
    this.logger.log(`Removed routing ${id}`);
  }
}
