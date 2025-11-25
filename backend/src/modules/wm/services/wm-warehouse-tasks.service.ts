import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from '../../core/entities/company.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { WmWarehouseTask, WarehouseTaskStatus } from '../entities/wm-warehouse-task.entity';
import { UpdateWarehouseTaskStatusDto } from '../dto/update-warehouse-task-status.dto';
import { WmBinStock } from '../entities/wm-bin-stock.entity';
import { WmStorageBin } from '../entities/wm-storage-bin.entity';
import { MmMaterial } from '../../mm/entities/mm-material.entity';
import { MmStock } from '../../mm/entities/mm-stock.entity';
import { TransportOrderStatus } from '../entities/wm-transport-order.entity';

@Injectable()
export class WmWarehouseTasksService {
  private readonly logger = new Logger(WmWarehouseTasksService.name);

  constructor(
    @InjectRepository(WmWarehouseTask)
    private readonly warehouseTasksRepository: Repository<WmWarehouseTask>,
    @InjectRepository(WmStorageBin)
    private readonly storageBinsRepository: Repository<WmStorageBin>,
    @InjectRepository(MmMaterial)
    private readonly materialsRepository: Repository<MmMaterial>,
    private readonly dataSource: DataSource,
  ) {}

  async updateStatus(taskId: number, dto: UpdateWarehouseTaskStatusDto): Promise<WmWarehouseTask> {
    const task = await this.warehouseTasksRepository.findOne({
      where: { id: taskId },
      relations: ['transportOrder', 'sourceBin', 'destinationBin', 'material', 'transportOrder.tasks'],
    });
    if (!task) {
      throw new NotFoundException('Warehouse task not found');
    }

    if (!this.isTransitionAllowed(task.status, dto.status)) {
      this.logger.warn(`Invalid warehouse task transition from ${task.status} to ${dto.status}`);
      throw new BadRequestException('Illegal status transition');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const managedTask = await queryRunner.manager.findOne(WmWarehouseTask, {
        where: { id: task.id },
        relations: ['transportOrder', 'sourceBin', 'destinationBin', 'material', 'transportOrder.tasks'],
      });
      if (!managedTask) {
        throw new NotFoundException('Warehouse task not found');
      }

      managedTask.status = dto.status;
      await queryRunner.manager.save(managedTask);

      if (dto.status === WarehouseTaskStatus.DONE) {
        await this.applyBinMovements(queryRunner, managedTask);
      }

      if (dto.status === WarehouseTaskStatus.IN_PROGRESS && managedTask.transportOrder.status === TransportOrderStatus.RELEASED) {
        managedTask.transportOrder.status = TransportOrderStatus.IN_PROGRESS;
        await queryRunner.manager.save(managedTask.transportOrder);
      }

      if (
        managedTask.transportOrder.tasks.every((t) =>
          t.id === managedTask.id ? managedTask.status === WarehouseTaskStatus.DONE : t.status === WarehouseTaskStatus.DONE,
        )
      ) {
        managedTask.transportOrder.status = TransportOrderStatus.COMPLETED;
        await queryRunner.manager.save(managedTask.transportOrder);
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Updated warehouse task ${task.id} to status ${dto.status}`);

      return this.warehouseTasksRepository.findOne({ where: { id: task.id }, relations: ['transportOrder', 'sourceBin', 'destinationBin', 'material'] }) as Promise<WmWarehouseTask>;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error updating warehouse task status', error instanceof Error ? error.stack : undefined);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private isTransitionAllowed(current: WarehouseTaskStatus, target: WarehouseTaskStatus): boolean {
    if (current === WarehouseTaskStatus.PENDING && target === WarehouseTaskStatus.IN_PROGRESS) {
      return true;
    }
    if (current === WarehouseTaskStatus.IN_PROGRESS && target === WarehouseTaskStatus.DONE) {
      return true;
    }
    if (
      (current === WarehouseTaskStatus.PENDING || current === WarehouseTaskStatus.IN_PROGRESS) &&
      target === WarehouseTaskStatus.CANCELLED
    ) {
      return true;
    }
    return false;
  }

  private async applyBinMovements(queryRunner: QueryRunner, task: WmWarehouseTask): Promise<void> {
    if (!task.destinationBin) {
      throw new BadRequestException('Destination bin required to complete task');
    }

    const material = await this.materialsRepository.findOne({ where: { id: task.material.id } });
    if (!material) {
      throw new NotFoundException('Material not found for task');
    }

    const sourceBin = task.sourceBin
      ? await this.storageBinsRepository.findOne({ where: { id: task.sourceBin.id } })
      : undefined;
    const destinationBin = await this.storageBinsRepository.findOne({ where: { id: task.destinationBin.id } });

    if (!destinationBin) {
      throw new NotFoundException('Destination bin not found');
    }

    if (sourceBin) {
      const sourceStock = await queryRunner.manager.findOne(WmBinStock, {
        where: { bin: { id: sourceBin.id }, material: { id: material.id } },
        relations: ['bin', 'material'],
      });
      if (!sourceStock || Number(sourceStock.quantity) < Number(task.quantity)) {
        this.logger.warn(`Insufficient stock in source bin ${sourceBin.code} for task ${task.id}`);
        throw new BadRequestException('Insufficient stock for task');
      }
      sourceStock.quantity = Number(sourceStock.quantity) - Number(task.quantity);
      await queryRunner.manager.save(sourceStock);
      await this.updateMmStock(queryRunner, task.transportOrder.company, material, sourceBin.code, -Number(task.quantity));
    }

    let destinationStock = await queryRunner.manager.findOne(WmBinStock, {
      where: { bin: { id: destinationBin.id }, material: { id: material.id } },
      relations: ['bin', 'material'],
    });
    if (!destinationStock) {
      destinationStock = queryRunner.manager.create(WmBinStock, {
        bin: destinationBin,
        material,
        quantity: 0,
        uom: task.uom,
      });
    }
    destinationStock.quantity = Number(destinationStock.quantity) + Number(task.quantity);
    destinationStock.uom = task.uom;
    await queryRunner.manager.save(destinationStock);
    await this.updateMmStock(queryRunner, task.transportOrder.company, material, destinationBin.code, Number(task.quantity));
  }

  private async updateMmStock(
    queryRunner: QueryRunner,
    company: Company,
    material: MmMaterial,
    storageLocationCode: string,
    quantityChange: number,
  ): Promise<void> {
    let stock = await queryRunner.manager.findOne(MmStock, {
      where: { company: { id: company.id }, material: { id: material.id }, storageLocationCode },
    });

    if (!stock && quantityChange < 0) {
      throw new BadRequestException('Insufficient MM stock');
    }

    if (!stock) {
      stock = queryRunner.manager.create(MmStock, {
        company,
        material,
        storageLocationCode,
        quantity: 0,
        currency: 'USD',
        totalValue: 0,
        lastMovementAt: new Date(),
      });
    }

    const newQuantity = Number(stock.quantity) + quantityChange;
    if (newQuantity < 0) {
      throw new BadRequestException('Insufficient MM stock');
    }

    stock.quantity = newQuantity;
    stock.lastMovementAt = new Date();
    await queryRunner.manager.save(stock);
  }
}
