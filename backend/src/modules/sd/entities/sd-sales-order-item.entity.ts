import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SdSalesOrder } from './sd-sales-order.entity';

@Entity('sd_sales_order_item')
@Index(['salesOrder', 'lineNumber'], { unique: true })
export class SdSalesOrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SdSalesOrder, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sales_order_id' })
  salesOrder: SdSalesOrder;

  @Column({ name: 'line_number' })
  lineNumber: number;

  @Column({ name: 'material_id' })
  materialId: number;

  @Column()
  description: string;

  @Column({ type: 'numeric', precision: 18, scale: 3 })
  quantity: number;

  @Column()
  uom: string;

  @Column({ name: 'unit_price', type: 'numeric', precision: 18, scale: 2 })
  unitPrice: number;

  @Column({ name: 'discount_percent', type: 'numeric', precision: 5, scale: 2, default: 0 })
  discountPercent: number;

  @Column({ name: 'net_amount', type: 'numeric', precision: 18, scale: 2 })
  netAmount: number;

  @Column({ name: 'tax_percent', type: 'numeric', precision: 5, scale: 2, default: 0 })
  taxPercent: number;

  @Column({ name: 'tax_amount', type: 'numeric', precision: 18, scale: 2 })
  taxAmount: number;

  @Column({ name: 'gross_amount', type: 'numeric', precision: 18, scale: 2 })
  grossAmount: number;

  @Column({ name: 'delivered_quantity', type: 'numeric', precision: 18, scale: 3, default: 0 })
  deliveredQuantity: number;

  @Column({ name: 'invoiced_quantity', type: 'numeric', precision: 18, scale: 3, default: 0 })
  invoicedQuantity: number;
}
