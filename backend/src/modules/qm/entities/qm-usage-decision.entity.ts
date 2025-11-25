import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { QmInspectionLot } from './qm-inspection-lot.entity';
import { User } from '../../auth/entities/user.entity';

export enum QmDecisionType {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
}

@Entity('qm_usage_decision')
export class QmUsageDecision {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => QmInspectionLot, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspection_lot_id' })
  inspectionLot: QmInspectionLot;

  @Column({ type: 'enum', enum: QmDecisionType })
  decision: QmDecisionType;

  @Column({ nullable: true })
  comments?: string | null;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'decided_by' })
  decidedBy?: User | null;

  @Column({ name: 'decided_at', type: 'timestamp' })
  decidedAt: Date;
}
