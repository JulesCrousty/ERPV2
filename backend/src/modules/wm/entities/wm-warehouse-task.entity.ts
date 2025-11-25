import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WmTransportOrder } from './wm-transport-order.entity';
import { WmStorageBin } from './wm-storage-bin.entity';
import { MmMaterial } from '../../mm/entities/mm-material.entity';

export enum WarehouseTaskType {
  PUTAWAY = 'PUTAWAY',
  PICKING = 'PICKING',
  INTERNAL_MOVE = 'INTERNAL_MOVE',
}

export enum WarehouseTaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

@Entity('wm_warehouse_task')
export class WmWarehouseTask {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => WmTransportOrder, (order) => order.tasks)
  @JoinColumn({ name: 'transport_order_id' })
  transportOrder: WmTransportOrder;

  @Column({ name: 'task_type', type: 'enum', enum: WarehouseTaskType })
  taskType: WarehouseTaskType;

  @Column({ type: 'enum', enum: WarehouseTaskStatus, default: WarehouseTaskStatus.PENDING })
  status: WarehouseTaskStatus;

  @ManyToOne(() => WmStorageBin, { nullable: true, eager: true })
  @JoinColumn({ name: 'source_bin_id' })
  sourceBin?: WmStorageBin;

  @ManyToOne(() => WmStorageBin, { nullable: true, eager: true })
  @JoinColumn({ name: 'destination_bin_id' })
  destinationBin?: WmStorageBin;

  @ManyToOne(() => MmMaterial, { eager: true })
  @JoinColumn({ name: 'material_id' })
  material: MmMaterial;

  @Column({ type: 'numeric', precision: 18, scale: 3 })
  quantity: number;

  @Column()
  uom: string;

  @Column()
  sequence: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
