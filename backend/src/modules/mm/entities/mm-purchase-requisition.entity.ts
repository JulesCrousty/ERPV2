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
import { User } from '../../auth/entities/user.entity';
import { MmPurchaseRequisitionItem } from './mm-purchase-requisition-item.entity';

export enum PurchaseRequisitionStatus {
  OPEN = 'OPEN',
  APPROVED = 'APPROVED',
  CONVERTED = 'CONVERTED',
  CANCELLED = 'CANCELLED',
}

@Entity('mm_purchase_requisition')
@Index(['company', 'prNumber'], { unique: true })
export class MmPurchaseRequisition {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'pr_number' })
  prNumber: string;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'requester_id' })
  requester?: User;

  @Column({ type: 'enum', enum: PurchaseRequisitionStatus, default: PurchaseRequisitionStatus.OPEN })
  status: PurchaseRequisitionStatus;

  @Column({ name: 'requested_date', type: 'date' })
  requestedDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => MmPurchaseRequisitionItem, (item) => item.requisition, {
    cascade: true,
    eager: true,
  })
  items: MmPurchaseRequisitionItem[];
}
