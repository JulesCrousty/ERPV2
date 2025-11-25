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
import { AnalyticsDataSource } from './analytics-datasource.entity';

export enum AnalyticsAggregationType {
  SUM = 'SUM',
  AVG = 'AVG',
  COUNT = 'COUNT',
  MAX = 'MAX',
  MIN = 'MIN',
}

@Entity('analytics_metric')
@Index(['code'], { unique: true })
export class AnalyticsMetric {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @ManyToOne(() => AnalyticsDataSource, { eager: true })
  @JoinColumn({ name: 'datasource_id' })
  datasource: AnalyticsDataSource;

  @Column({ type: 'enum', enum: AnalyticsAggregationType })
  aggregation: AnalyticsAggregationType;

  @Column()
  field: string;

  @Column({ type: 'jsonb', nullable: true })
  filters?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
