import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PpRouting } from './pp-routing.entity';
import { PpWorkCenter } from './pp-work-center.entity';

@Entity('pp_routing_operation')
@Index(['routing', 'operationNumber'], { unique: true })
export class PpRoutingOperation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PpRouting, (routing) => routing.operations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'routing_id' })
  routing: PpRouting;

  @Column({ name: 'operation_number' })
  operationNumber: number;

  @ManyToOne(() => PpWorkCenter, { eager: true })
  @JoinColumn({ name: 'work_center_id' })
  workCenter: PpWorkCenter;

  @Column()
  description: string;

  @Column({ name: 'setup_time_hours', type: 'numeric', precision: 18, scale: 3, nullable: true })
  setupTimeHours?: number;

  @Column({ name: 'processing_time_hours', type: 'numeric', precision: 18, scale: 3, nullable: true })
  processingTimeHours?: number;

  @Column({ name: 'move_time_hours', type: 'numeric', precision: 18, scale: 3, nullable: true })
  moveTimeHours?: number;

  @Column({ name: 'queue_time_hours', type: 'numeric', precision: 18, scale: 3, nullable: true })
  queueTimeHours?: number;

  @Column({ nullable: true })
  sequence?: number;
}
