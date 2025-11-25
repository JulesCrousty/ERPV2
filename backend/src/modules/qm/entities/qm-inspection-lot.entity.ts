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
import { Company } from '../../core/entities/company.entity';
import { MmMaterial } from '../../mm/entities/mm-material.entity';
import { User } from '../../auth/entities/user.entity';

export enum QMStatus {
  CREATED = 'CREATED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESULTS_RECORDED = 'RESULTS_RECORDED',
  UD_PENDING = 'UD_PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CLOSED = 'CLOSED',
}

export enum QmReferenceType {
  MM_GR = 'MM_GR',
  PP_ORDER = 'PP_ORDER',
  MANUAL = 'MANUAL',
}

@Entity('qm_inspection_lot')
@Index(['company', 'lotNumber'], { unique: true })
export class QmInspectionLot {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'lot_number' })
  lotNumber: string;

  @Column({ name: 'reference_type', type: 'enum', enum: QmReferenceType })
  referenceType: QmReferenceType;

  @Column({ name: 'reference_id', type: 'int', nullable: true })
  referenceId: number | null;

  @ManyToOne(() => MmMaterial, { eager: true })
  @JoinColumn({ name: 'material_id' })
  material: MmMaterial;

  @Column({ type: 'numeric', precision: 18, scale: 3 })
  quantity: number;

  @Column()
  uom: string;

  @Column({ type: 'enum', enum: QMStatus, default: QMStatus.CREATED })
  status: QMStatus;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
