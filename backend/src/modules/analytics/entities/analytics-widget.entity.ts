import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AnalyticsDashboard } from './analytics-dashboard.entity';

export enum AnalyticsWidgetType {
  KPI = 'KPI',
  TABLE = 'TABLE',
  BAR = 'BAR',
  LINE = 'LINE',
  PIE = 'PIE',
  DONUT = 'DONUT',
}

@Entity('analytics_widget')
export class AnalyticsWidget {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AnalyticsDashboard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dashboard_id' })
  dashboard: AnalyticsDashboard;

  @Column({ type: 'enum', enum: AnalyticsWidgetType })
  type: AnalyticsWidgetType;

  @Column({ name: 'dataset_code' })
  datasetCode: string;

  @Column({ name: 'metric_code', nullable: true })
  metricCode?: string;

  @Column({ type: 'jsonb' })
  config: any;

  @Column({ type: 'jsonb' })
  position: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
