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
import { MmMaterial } from './mm-material.entity';

@Entity('mm_stock')
@Index(['company', 'material', 'storageLocationCode'], { unique: true })
export class MmStock {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => MmMaterial, { eager: true })
  @JoinColumn({ name: 'material_id' })
  material: MmMaterial;

  @Column({ name: 'storage_location_code' })
  storageLocationCode: string;

  @Column({ type: 'numeric', precision: 18, scale: 3, default: 0 })
  quantity: number;

  @Column({ name: 'total_value', type: 'numeric', precision: 18, scale: 2, default: 0 })
  totalValue: number;

  @Column()
  currency: string;

  @Column({ name: 'last_movement_at', type: 'timestamp' })
  lastMovementAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
