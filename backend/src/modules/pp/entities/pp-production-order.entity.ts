import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../core/entities/company.entity';
import { MmMaterial } from '../../mm/entities/mm-material.entity';
import { PpBom } from './pp-bom.entity';
import { PpRouting } from './pp-routing.entity';
import { User } from '../../auth/entities/user.entity';
import { PpProductionOrderOperation } from './pp-production-order-operation.entity';
import { PpMaterialConsumption } from './pp-material-consumption.entity';
import { PpFinishedGoodsReceipt } from './pp-finished-goods-receipt.entity';

export type ProductionOrderStatus =
  | 'PLANNED'
  | 'RELEASED'
  | 'IN_PROGRESS'
  | 'PARTIALLY_CONFIRMED'
  | 'CONFIRMED'
  | 'CLOSED'
  | 'CANCELLED';

@Entity('pp_production_order')
@Index(['company', 'orderNumber'], { unique: true })
export class PpProductionOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'order_number' })
  orderNumber: string;

  @ManyToOne(() => MmMaterial, { eager: true })
  @JoinColumn({ name: 'material_id' })
  material: MmMaterial;

  @Column({ name: 'planned_quantity', type: 'numeric', precision: 18, scale: 3 })
  plannedQuantity: number;

  @Column()
  uom: string;

  @Column({ type: 'varchar' })
  status: ProductionOrderStatus;

  @ManyToOne(() => PpBom, { eager: true, nullable: true })
  @JoinColumn({ name: 'bom_id' })
  bom?: PpBom | null;

  @ManyToOne(() => PpRouting, { eager: true, nullable: true })
  @JoinColumn({ name: 'routing_id' })
  routing?: PpRouting | null;

  @Column({ name: 'start_date_planned', type: 'timestamp', nullable: true })
  startDatePlanned?: Date | null;

  @Column({ name: 'end_date_planned', type: 'timestamp', nullable: true })
  endDatePlanned?: Date | null;

  @Column({ name: 'start_date_actual', type: 'timestamp', nullable: true })
  startDateActual?: Date | null;

  @Column({ name: 'end_date_actual', type: 'timestamp', nullable: true })
  endDateActual?: Date | null;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @OneToMany(() => PpProductionOrderOperation, (op) => op.productionOrder)
  operations?: PpProductionOrderOperation[];

  @OneToMany(() => PpMaterialConsumption, (consumption) => consumption.productionOrder)
  consumptions?: PpMaterialConsumption[];

  @OneToMany(() => PpFinishedGoodsReceipt, (receipt) => receipt.productionOrder)
  receipts?: PpFinishedGoodsReceipt[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
