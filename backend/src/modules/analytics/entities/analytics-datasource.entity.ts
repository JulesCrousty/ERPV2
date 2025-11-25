import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Company } from '../../core/entities/company.entity';

@Entity('analytics_datasource')
@Index(['code'], { unique: true })
export class AnalyticsDataSource {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'entity_name' })
  entityName: string;

  @Column({ type: 'text', array: true, name: 'allowed_fields' })
  allowedFields: string[];

  @Column({ type: 'text', array: true, name: 'filterable_fields' })
  filterableFields: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
