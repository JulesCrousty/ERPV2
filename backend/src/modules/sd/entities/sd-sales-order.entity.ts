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
import { SdCustomer } from './sd-customer.entity';
import { User } from '../../auth/entities/user.entity';
import { SdSalesOrderItem } from './sd-sales-order-item.entity';

export enum SalesOrderStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  PARTIALLY_DELIVERED = 'PARTIALLY_DELIVERED',
  DELIVERED = 'DELIVERED',
  INVOICED = 'INVOICED',
  CANCELLED = 'CANCELLED',
}

@Entity('sd_sales_order')
@Index(['company', 'orderNumber'], { unique: true })
export class SdSalesOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'order_number' })
  orderNumber: string;

  @ManyToOne(() => SdCustomer, { eager: true })
  @JoinColumn({ name: 'customer_id' })
  customer: SdCustomer;

  @Column({ name: 'order_date', type: 'date' })
  orderDate: Date;

  @Column({ name: 'requested_delivery_date', type: 'date', nullable: true })
  requestedDeliveryDate?: Date;

  @Column()
  currency: string;

  @Column({ type: 'enum', enum: SalesOrderStatus, default: SalesOrderStatus.DRAFT })
  status: SalesOrderStatus;

  @Column({ name: 'total_net_amount', type: 'numeric', precision: 18, scale: 2 })
  totalNetAmount: number;

  @Column({ name: 'total_gross_amount', type: 'numeric', precision: 18, scale: 2 })
  totalGrossAmount: number;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => SdSalesOrderItem, (item) => item.salesOrder, { cascade: true, eager: true })
  items: SdSalesOrderItem[];
}
