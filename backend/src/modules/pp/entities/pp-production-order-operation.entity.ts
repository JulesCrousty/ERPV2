import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PpProductionOrder } from './pp-production-order.entity';
import { PpWorkCenter } from './pp-work-center.entity';

export type ProductionOrderOperationStatus = 'PLANNED' | 'IN_PROGRESS' | 'PARTIALLY_CONFIRMED' | 'CONFIRMED';

@Entity('pp_production_order_operation')
@Index(['productionOrder', 'operationNumber'], { unique: true })
export class PpProductionOrderOperation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PpProductionOrder, (order) => order.operations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'production_order_id' })
  productionOrder: PpProductionOrder;

  @Column({ name: 'operation_number' })
  operationNumber: number;

  @ManyToOne(() => PpWorkCenter, { eager: true })
  @JoinColumn({ name: 'work_center_id' })
  workCenter: PpWorkCenter;

  @Column()
  description: string;

  @Column({ type: 'varchar' })
  status: ProductionOrderOperationStatus;

  @Column({ name: 'planned_time_hours', type: 'numeric', precision: 18, scale: 3, nullable: true })
  plannedTimeHours?: number;

  @Column({ name: 'actual_time_hours', type: 'numeric', precision: 18, scale: 3, nullable: true })
  actualTimeHours?: number;

  @Column()
  sequence: number;
}
