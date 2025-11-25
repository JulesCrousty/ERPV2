import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FiDocument } from './fi-document.entity';
import { FiAccount } from './fi-account.entity';

@Entity('fi_document_line')
@Index(['document', 'lineNumber'], { unique: true })
@Check(
  'CHK_fi_document_line_debit_credit',
  '("debit" > 0 AND "credit" = 0) OR ("credit" > 0 AND "debit" = 0)',
)
export class FiDocumentLine {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => FiDocument, (document) => document.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fi_document_id' })
  document: FiDocument;

  @Column({ name: 'line_number' })
  lineNumber: number;

  @ManyToOne(() => FiAccount, { eager: true })
  @JoinColumn({ name: 'fi_account_id' })
  account: FiAccount;

  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0 })
  debit: number;

  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0 })
  credit: number;

  @Column({ nullable: true })
  text?: string;

  @Column({ name: 'cost_center', nullable: true })
  costCenter?: string;

  @Column({ name: 'profit_center', nullable: true })
  profitCenter?: string;

  @Column({ name: 'customer_id', type: 'int', nullable: true })
  customerId?: number;

  @Column({ name: 'vendor_id', type: 'int', nullable: true })
  vendorId?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
