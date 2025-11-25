import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MmPurchaseRequisition } from './mm-purchase-requisition.entity';
import { MmMaterial } from './mm-material.entity';

@Entity('mm_purchase_requisition_item')
export class MmPurchaseRequisitionItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => MmPurchaseRequisition, (requisition) => requisition.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'requisition_id' })
  requisition: MmPurchaseRequisition;

  @Column({ name: 'line_number' })
  lineNumber: number;

  @ManyToOne(() => MmMaterial, { eager: true })
  @JoinColumn({ name: 'material_id' })
  material: MmMaterial;

  @Column({ type: 'numeric', precision: 18, scale: 3 })
  quantity: number;

  @Column()
  uom: string;

  @Column({ name: 'desired_delivery_date', type: 'date', nullable: true })
  desiredDeliveryDate?: Date;

  @Column({ nullable: true })
  note?: string;
}
