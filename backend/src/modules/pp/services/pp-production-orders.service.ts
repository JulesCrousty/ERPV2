import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PpProductionOrder, ProductionOrderStatus } from '../entities/pp-production-order.entity';
import { PpProductionOrderOperation, ProductionOrderOperationStatus } from '../entities/pp-production-order-operation.entity';
import { PpMaterialConsumption } from '../entities/pp-material-consumption.entity';
import { PpFinishedGoodsReceipt } from '../entities/pp-finished-goods-receipt.entity';
import { CreateProductionOrderDto } from '../dto/create-production-order.dto';
import { UpdateProductionOrderStatusDto } from '../dto/update-production-order-status.dto';
import { ConfirmOperationDto } from '../dto/confirm-operation.dto';
import { PostMaterialConsumptionDto } from '../dto/post-material-consumption.dto';
import { PostFinishedGoodsReceiptDto } from '../dto/post-finished-goods-receipt.dto';
import { PpRouting } from '../entities/pp-routing.entity';
import { PpBom } from '../entities/pp-bom.entity';
import { MmMaterial } from '../../mm/entities/mm-material.entity';
import { MmStock } from '../../mm/entities/mm-stock.entity';
import { Company } from '../../core/entities/company.entity';

@Injectable()
export class PpProductionOrdersService {
  private readonly logger = new Logger(PpProductionOrdersService.name);

  constructor(
    @InjectRepository(PpProductionOrder)
    private readonly productionOrdersRepository: Repository<PpProductionOrder>,
    @InjectRepository(PpProductionOrderOperation)
    private readonly productionOrderOperationsRepository: Repository<PpProductionOrderOperation>,
    @InjectRepository(PpRouting)
    private readonly routingsRepository: Repository<PpRouting>,
    @InjectRepository(PpBom)
    private readonly bomsRepository: Repository<PpBom>,
    @InjectRepository(MmMaterial)
    private readonly materialsRepository: Repository<MmMaterial>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    private readonly dataSource: DataSource,
  ) {}

  private generateOrderNumber(companyId: number): string {
    return `PO-${companyId}-${Date.now()}`;
  }

  async create(dto: CreateProductionOrderDto): Promise<PpProductionOrder> {
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const material = await this.materialsRepository.findOne({ where: { id: dto.material_id } });
    if (!material) {
      throw new NotFoundException('Material not found');
    }

    const bom = dto.bom_id ? await this.bomsRepository.findOne({ where: { id: dto.bom_id } }) : undefined;
    const routing = dto.routing_id
      ? await this.routingsRepository.findOne({ where: { id: dto.routing_id }, relations: ['operations'] })
      : undefined;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const productionOrder = queryRunner.manager.create(PpProductionOrder, {
        company,
        material,
        plannedQuantity: dto.planned_quantity,
        uom: dto.uom,
        status: 'PLANNED' as ProductionOrderStatus,
        bom: bom ?? null,
        routing: routing ?? null,
        orderNumber: this.generateOrderNumber(company.id),
        startDatePlanned: dto.start_date_planned ? new Date(dto.start_date_planned) : null,
        endDatePlanned: dto.end_date_planned ? new Date(dto.end_date_planned) : null,
      });

      const savedOrder = await queryRunner.manager.save(productionOrder);

      if (routing?.operations?.length) {
        for (const routingOp of routing.operations) {
          const prodOp = queryRunner.manager.create(PpProductionOrderOperation, {
            productionOrder: savedOrder,
            operationNumber: routingOp.operationNumber,
            workCenter: routingOp.workCenter,
            description: routingOp.description,
            status: 'PLANNED' as ProductionOrderOperationStatus,
            plannedTimeHours: routingOp.processingTimeHours ?? routingOp.setupTimeHours,
            sequence: routingOp.sequence ?? routingOp.operationNumber,
          });
          await queryRunner.manager.save(prodOp);
        }
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Created production order ${productionOrder.orderNumber} for company ${company.id}`);
      return this.productionOrdersRepository.findOne({ where: { id: savedOrder.id }, relations: ['operations'] });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to create production order', error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(filters?: {
    company_id?: number;
    material_id?: number;
    status?: string;
  }): Promise<PpProductionOrder[]> {
    const where: any = {};
    if (filters?.company_id) {
      where.company = { id: filters.company_id } as any;
    }
    if (filters?.material_id) {
      where.material = { id: filters.material_id } as any;
    }
    if (filters?.status) {
      where.status = filters.status as ProductionOrderStatus;
    }
    return this.productionOrdersRepository.find({ where, relations: ['operations'] });
  }

  async findOne(id: number): Promise<PpProductionOrder> {
    const order = await this.productionOrdersRepository.findOne({ where: { id }, relations: ['operations'] });
    if (!order) {
      throw new NotFoundException('Production order not found');
    }
    return order;
  }

  async updateStatus(id: number, dto: UpdateProductionOrderStatusDto): Promise<PpProductionOrder> {
    const order = await this.findOne(id);
    const allowedTransitions: Record<ProductionOrderStatus, ProductionOrderStatus[]> = {
      PLANNED: ['RELEASED'],
      RELEASED: ['CANCELLED', 'IN_PROGRESS'],
      IN_PROGRESS: ['CANCELLED'],
      PARTIALLY_CONFIRMED: ['CONFIRMED'],
      CONFIRMED: ['CLOSED'],
      CLOSED: [],
      CANCELLED: [],
    };

    if (!allowedTransitions[order.status].includes(dto.status)) {
      this.logger.warn(`Invalid status transition from ${order.status} to ${dto.status}`);
      throw new BadRequestException('Invalid status transition');
    }

    order.status = dto.status;
    const saved = await this.productionOrdersRepository.save(order);
    this.logger.log(`Updated production order ${order.orderNumber} to status ${dto.status}`);
    return saved;
  }

  async confirmOperation(dto: ConfirmOperationDto): Promise<PpProductionOrderOperation> {
    const operation = await this.productionOrderOperationsRepository.findOne({
      where: { id: dto.operation_id },
      relations: ['productionOrder'],
    });
    if (!operation) {
      throw new NotFoundException('Operation not found');
    }

    const order = operation.productionOrder;
    operation.actualTimeHours = dto.actual_time_hours;
    operation.status = dto.quantity_confirmed >= order.plannedQuantity ? 'CONFIRMED' : 'PARTIALLY_CONFIRMED';

    if (order.status === 'PLANNED') {
      order.status = 'IN_PROGRESS';
    }
    if (dto.is_last_operation) {
      order.status = dto.quantity_confirmed >= order.plannedQuantity ? 'CONFIRMED' : 'PARTIALLY_CONFIRMED';
    }

    await this.productionOrdersRepository.save(order);
    const savedOperation = await this.productionOrderOperationsRepository.save(operation);
    this.logger.log(`Confirmed operation ${operation.id} for order ${order.orderNumber}`);
    return savedOperation;
  }

  async postMaterialConsumption(dto: PostMaterialConsumptionDto): Promise<void> {
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const order = await this.productionOrdersRepository.findOne({ where: { id: dto.production_order_id } });
    if (!order) {
      throw new NotFoundException('Production order not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of dto.items) {
        const material = await this.materialsRepository.findOne({ where: { id: item.material_id } });
        if (!material) {
          throw new NotFoundException(`Material ${item.material_id} not found`);
        }

        const consumption = queryRunner.manager.create(PpMaterialConsumption, {
          company,
          productionOrder: order,
          material,
          storageLocationCode: item.storage_location_code,
          quantity: item.quantity,
          uom: item.uom,
          movementType: '261',
          postingDate: new Date(dto.posting_date),
          createdBy: order.createdBy,
        });
        await queryRunner.manager.save(consumption);

        let stock = await queryRunner.manager.findOne(MmStock, {
          where: {
            company: { id: dto.company_id },
            material: { id: item.material_id },
            storageLocationCode: item.storage_location_code,
          },
        });
        if (!stock) {
          stock = queryRunner.manager.create(MmStock, {
            company,
            material,
            storageLocationCode: item.storage_location_code,
            quantity: 0,
            totalValue: 0,
            currency: 'USD',
            lastMovementAt: new Date(dto.posting_date),
          });
        }

        if (Number(stock.quantity) < Number(item.quantity)) {
          this.logger.warn(`Insufficient stock for material ${material.id} at ${item.storage_location_code}`);
        }

        stock.quantity = Number(stock.quantity) - Number(item.quantity);
        stock.lastMovementAt = new Date(dto.posting_date);
        await queryRunner.manager.save(stock);
      }

      if (order.status === 'RELEASED') {
        order.status = 'IN_PROGRESS';
        await queryRunner.manager.save(order);
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Posted material consumption for order ${order.orderNumber}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to post material consumption', error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async postFinishedGoodsReceipt(dto: PostFinishedGoodsReceiptDto): Promise<void> {
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const order = await this.productionOrdersRepository.findOne({ where: { id: dto.production_order_id } });
    if (!order) {
      throw new NotFoundException('Production order not found');
    }

    const material = await this.materialsRepository.findOne({ where: { id: dto.material_id } });
    if (!material) {
      throw new NotFoundException('Material not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const receipt = queryRunner.manager.create(PpFinishedGoodsReceipt, {
        company,
        productionOrder: order,
        material,
        storageLocationCode: dto.storage_location_code,
        quantity: dto.quantity,
        uom: dto.uom,
        movementType: '101',
        postingDate: new Date(dto.posting_date),
        createdBy: order.createdBy,
      });
      await queryRunner.manager.save(receipt);

      let stock = await queryRunner.manager.findOne(MmStock, {
        where: {
          company: { id: dto.company_id },
          material: { id: dto.material_id },
          storageLocationCode: dto.storage_location_code,
        },
      });

      if (!stock) {
        stock = queryRunner.manager.create(MmStock, {
          company,
          material,
          storageLocationCode: dto.storage_location_code,
          quantity: 0,
          totalValue: 0,
          currency: 'USD',
          lastMovementAt: new Date(dto.posting_date),
        });
      }

      stock.quantity = Number(stock.quantity) + Number(dto.quantity);
      stock.lastMovementAt = new Date(dto.posting_date);
      stock.totalValue = Number(stock.totalValue) + Number(dto.quantity) * 0;
      await queryRunner.manager.save(stock);

      if (Number(dto.quantity) >= Number(order.plannedQuantity)) {
        order.status = 'CONFIRMED';
      } else if (Number(dto.quantity) > 0) {
        order.status = 'PARTIALLY_CONFIRMED';
      }
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();
      this.logger.log(`Posted finished goods receipt for order ${order.orderNumber}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to post finished goods receipt', error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
