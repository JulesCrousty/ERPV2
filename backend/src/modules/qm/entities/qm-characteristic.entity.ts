import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Company } from '../../core/entities/company.entity';

@Entity('qm_characteristic')
@Index(['company', 'code'], { unique: true })
export class QmCharacteristic {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  code: string;

  @Column()
  description: string;

  @Column({ name: 'lower_limit', type: 'numeric', precision: 18, scale: 3, nullable: true })
  lowerLimit?: number | null;

  @Column({ name: 'upper_limit', type: 'numeric', precision: 18, scale: 3, nullable: true })
  upperLimit?: number | null;

  @Column({ name: 'target_value', type: 'numeric', precision: 18, scale: 3, nullable: true })
  targetValue?: number | null;

  @Column()
  uom: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
