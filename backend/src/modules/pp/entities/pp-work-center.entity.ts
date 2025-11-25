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

@Entity('pp_work_center')
@Index(['company', 'code'], { unique: true })
export class PpWorkCenter {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'capacity_per_hour', type: 'numeric', precision: 18, scale: 3, nullable: true })
  capacityPerHour?: number;

  @Column({ name: 'cost_per_hour', type: 'numeric', precision: 18, scale: 2, nullable: true })
  costPerHour?: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
