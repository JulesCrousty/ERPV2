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
import { FiscalPeriod } from '../../core/entities/fiscal-period.entity';
import { User } from '../../auth/entities/user.entity';
import { FiDocumentLine } from './fi-document-line.entity';

export enum FiDocumentStatus {
  PARKED = 'PARKED',
  POSTED = 'POSTED',
  REVERSED = 'REVERSED',
}

@Entity('fi_document')
@Index(['company', 'documentNumber'], { unique: true })
export class FiDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'document_number' })
  documentNumber: string;

  @Column({ name: 'document_date', type: 'date' })
  documentDate: Date;

  @Column({ name: 'posting_date', type: 'date' })
  postingDate: Date;

  @Column()
  currency: string;

  @Column({ nullable: true })
  reference?: string;

  @ManyToOne(() => FiscalPeriod, { eager: true })
  @JoinColumn({ name: 'fiscal_period_id' })
  fiscalPeriod: FiscalPeriod;

  @Column({ type: 'enum', enum: FiDocumentStatus, default: FiDocumentStatus.POSTED })
  status: FiDocumentStatus;

  @Column({ name: 'total_debit', type: 'numeric', precision: 18, scale: 2, default: 0 })
  totalDebit: number;

  @Column({ name: 'total_credit', type: 'numeric', precision: 18, scale: 2, default: 0 })
  totalCredit: number;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @OneToMany(() => FiDocumentLine, (line) => line.document, { cascade: true })
  lines: FiDocumentLine[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
