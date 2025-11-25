import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WmWarehouse } from './wm-warehouse.entity';

export enum PutawayStrategy {
  FIXED = 'FIXED',
  FILL = 'FILL',
  EMPTY_FIRST = 'EMPTY_FIRST',
}

export enum PickingStrategy {
  FIFO = 'FIFO',
  LIFO = 'LIFO',
  PRIORITY = 'PRIORITY',
}

@Entity('wm_storage_type')
@Index(['warehouse', 'code'], { unique: true })
export class WmStorageType {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => WmWarehouse, { eager: true })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: WmWarehouse;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'putaway_strategy', type: 'enum', enum: PutawayStrategy })
  putawayStrategy: PutawayStrategy;

  @Column({ name: 'picking_strategy', type: 'enum', enum: PickingStrategy })
  pickingStrategy: PickingStrategy;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
