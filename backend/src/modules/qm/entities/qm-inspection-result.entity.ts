import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { QmInspectionLot } from './qm-inspection-lot.entity';
import { QmCharacteristic } from './qm-characteristic.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('qm_inspection_result')
export class QmInspectionResult {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => QmInspectionLot, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspection_lot_id' })
  inspectionLot: QmInspectionLot;

  @ManyToOne(() => QmCharacteristic, { eager: true })
  @JoinColumn({ name: 'characteristic_id' })
  characteristic: QmCharacteristic;

  @Column({ name: 'measured_value', type: 'numeric', precision: 18, scale: 3, nullable: true })
  measuredValue?: number | null;

  @Column({ type: 'boolean', nullable: true })
  ok?: boolean | null;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'recorded_by' })
  recordedBy?: User | null;

  @Column({ name: 'recorded_at', type: 'timestamp' })
  recordedAt: Date;
}
