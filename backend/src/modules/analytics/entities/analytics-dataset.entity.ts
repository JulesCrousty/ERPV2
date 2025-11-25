import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Company } from '../../core/entities/company.entity';

@Entity('analytics_dataset')
@Index(['code'], { unique: true })
export class AnalyticsDataset {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'jsonb' })
  datasources: Array<{ code: string; join?: string }>;

  @Column({ type: 'jsonb' })
  fields: Array<string>;

  @Column({ type: 'jsonb', nullable: true })
  filters?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
