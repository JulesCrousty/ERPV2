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

export enum MaterialType {
  RAW = 'RAW',
  SEMI_FINISHED = 'SEMI_FINISHED',
  FINISHED = 'FINISHED',
  SERVICE = 'SERVICE',
}

@Entity('mm_material')
@Index(['company', 'materialCode'], { unique: true })
export class MmMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'material_code' })
  materialCode: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'material_type', type: 'enum', enum: MaterialType })
  materialType: MaterialType;

  @Column({ name: 'base_uom' })
  baseUom: string;

  @Column({ name: 'purchasing_group', nullable: true })
  purchasingGroup?: string;

  @Column({ name: 'valuation_class', nullable: true })
  valuationClass?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
