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
import { MmVendor } from './mm-vendor.entity';
import { MmPurchaseOrder } from './mm-purchase-order.entity';
import { User } from '../../auth/entities/user.entity';
import { MmGoodsReceiptItem } from './mm-goods-receipt-item.entity';

export enum GoodsReceiptStatus {
  POSTED = 'POSTED',
  REVERSED = 'REVERSED',
}

@Entity('mm_goods_receipt')
@Index(['company', 'grNumber'], { unique: true })
export class MmGoodsReceipt {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'gr_number' })
  grNumber: string;

  @Column({ name: 'posting_date', type: 'date' })
  postingDate: Date;

  @ManyToOne(() => MmVendor, { eager: true, nullable: true })
  @JoinColumn({ name: 'vendor_id' })
  vendor?: MmVendor;

  @ManyToOne(() => MmPurchaseOrder, { eager: true, nullable: true })
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder?: MmPurchaseOrder;

  @Column({ type: 'enum', enum: GoodsReceiptStatus, default: GoodsReceiptStatus.POSTED })
  status: GoodsReceiptStatus;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => MmGoodsReceiptItem, (item) => item.goodsReceipt, {
    cascade: true,
    eager: true,
  })
  items: MmGoodsReceiptItem[];
}
