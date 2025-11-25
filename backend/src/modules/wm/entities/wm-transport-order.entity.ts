import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../core/entities/company.entity';
import { User } from '../../auth/entities/user.entity';
import { WmWarehouseTask } from './wm-warehouse-task.entity';

export enum TransportOrderStatus {
  CREATED = 'CREATED',
  RELEASED = 'RELEASED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('wm_transport_order')
export class WmTransportOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'to_number', unique: true })
  toNumber: string;

  @Column({ type: 'enum', enum: TransportOrderStatus, default: TransportOrderStatus.CREATED })
  status: TransportOrderStatus;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @OneToMany(() => WmWarehouseTask, (task) => task.transportOrder, { cascade: true })
  tasks: WmWarehouseTask[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
