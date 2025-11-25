import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { WmTransportOrder, TransportOrderStatus } from '../entities/wm-transport-order.entity';
import { WmWarehouseTask, WarehouseTaskStatus } from '../entities/wm-warehouse-task.entity';
import { CreateTransportOrderDto } from '../dto/create-transport-order.dto';
import { UpdateTransportOrderStatusDto } from '../dto/update-transport-order-status.dto';
import { Company } from '../../core/entities/company.entity';
import { MmMaterial } from '../../mm/entities/mm-material.entity';
import { WmStorageBin } from '../entities/wm-storage-bin.entity';

@Injectable()
export class WmTransportOrdersService {
  private readonly logger = new Logger(WmTransportOrdersService.name);

  constructor(
    @InjectRepository(WmTransportOrder)
    private readonly transportOrdersRepository: Repository<WmTransportOrder>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(MmMaterial)
    private readonly materialsRepository: Repository<MmMaterial>,
    @InjectRepository(WmStorageBin)
    private readonly storageBinsRepository: Repository<WmStorageBin>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateTransportOrderDto): Promise<WmTransportOrder> {
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const toNumber = await this.generateUniqueToNumber();

      const transportOrder = queryRunner.manager.create(WmTransportOrder, {
        company,
        toNumber,
        status: TransportOrderStatus.CREATED,
      });
      const savedOrder = await queryRunner.manager.save(transportOrder);

      const tasks: WmWarehouseTask[] = [];
      for (let index = 0; index < dto.tasks.length; index++) {
        const taskDto = dto.tasks[index];
        const material = await this.materialsRepository.findOne({ where: { id: taskDto.material_id } });
        if (!material) {
          throw new NotFoundException(`Material ${taskDto.material_id} not found`);
        }
        const sourceBin = taskDto.source_bin_id
          ? await this.storageBinsRepository.findOne({ where: { id: taskDto.source_bin_id } })
          : undefined;
        const destinationBin = taskDto.destination_bin_id
          ? await this.storageBinsRepository.findOne({ where: { id: taskDto.destination_bin_id } })
          : undefined;

        const task = queryRunner.manager.create(WmWarehouseTask, {
          transportOrder: savedOrder,
          taskType: taskDto.task_type,
          status: WarehouseTaskStatus.PENDING,
          sourceBin,
          destinationBin,
          material,
          quantity: taskDto.quantity,
          uom: taskDto.uom,
          sequence: taskDto.sequence ?? index + 1,
        });
        tasks.push(task);
      }

      await queryRunner.manager.save(tasks);
      await queryRunner.commitTransaction();

      const orderWithTasks = await this.transportOrdersRepository.findOne({
        where: { id: savedOrder.id },
        relations: ['tasks'],
      });

      this.logger.log(`Created transport order ${toNumber} with ${tasks.length} tasks`);
      return orderWithTasks as WmTransportOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to create transport order', error instanceof Error ? error.stack : undefined);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  findAll(filters?: { companyId?: number; status?: TransportOrderStatus }): Promise<WmTransportOrder[]> {
    const where: any = {};
    if (filters?.companyId) {
      where.company = { id: filters.companyId };
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    return this.transportOrdersRepository.find({ where, relations: ['tasks'] });
  }

  async findOne(id: number): Promise<WmTransportOrder> {
    const order = await this.transportOrdersRepository.findOne({ where: { id }, relations: ['tasks'] });
    if (!order) {
      throw new NotFoundException('Transport order not found');
    }
    return order;
  }

  async updateStatus(id: number, dto: UpdateTransportOrderStatusDto): Promise<WmTransportOrder> {
    const order = await this.findOne(id);
    const targetStatus = dto.status;

    if (!this.isTransitionAllowed(order.status, targetStatus, order.tasks)) {
      this.logger.warn(`Invalid transport order status transition from ${order.status} to ${targetStatus}`);
      throw new BadRequestException('Illegal status transition');
    }

    order.status = targetStatus;
    const saved = await this.transportOrdersRepository.save(order);

    this.logger.log(`Updated transport order ${order.toNumber} status to ${targetStatus}`);
    return saved;
  }

  private isTransitionAllowed(
    current: TransportOrderStatus,
    target: TransportOrderStatus,
    tasks?: WmWarehouseTask[],
  ): boolean {
    if (current === TransportOrderStatus.CREATED && target === TransportOrderStatus.RELEASED) {
      return true;
    }
    if (current === TransportOrderStatus.RELEASED && target === TransportOrderStatus.IN_PROGRESS) {
      return true;
    }
    if (current === TransportOrderStatus.IN_PROGRESS && target === TransportOrderStatus.COMPLETED) {
      return tasks?.every((task) => task.status === WarehouseTaskStatus.DONE) ?? false;
    }
    if (
      (current === TransportOrderStatus.CREATED || current === TransportOrderStatus.RELEASED) &&
      target === TransportOrderStatus.CANCELLED
    ) {
      return true;
    }
    return false;
  }

  private async generateUniqueToNumber(): Promise<string> {
    let unique = false;
    let toNumber = '';

    while (!unique) {
      toNumber = `TO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const existing = await this.transportOrdersRepository.findOne({ where: { toNumber } });
      unique = !existing;
    }

    return toNumber;
  }
}
