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
import { WmStorageType } from './wm-storage-type.entity';

@Entity('wm_storage_bin')
@Index(['storageType', 'code'], { unique: true })
export class WmStorageBin {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => WmStorageType, { eager: true })
  @JoinColumn({ name: 'storage_type_id' })
  storageType: WmStorageType;

  @Column()
  code: string;

  @Column({ name: 'is_blocked', default: false })
  isBlocked: boolean;

  @Column({ name: 'block_reason', nullable: true })
  blockReason?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
