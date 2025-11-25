import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Company } from '../../core/entities/company.entity';
import { MmMaterial } from '../../mm/entities/mm-material.entity';

@Entity('qm_quality_level')
@Index(['company', 'material'], { unique: true })
export class QmQualityLevel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => MmMaterial, { eager: true })
  @JoinColumn({ name: 'material_id' })
  material: MmMaterial;

  @Column({ name: 'quality_score', type: 'numeric', precision: 5, scale: 2, default: 0 })
  qualityScore: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
