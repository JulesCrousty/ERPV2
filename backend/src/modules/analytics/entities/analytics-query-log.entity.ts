import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('analytics_query_log')
export class AnalyticsQueryLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'datasource_code' })
  datasourceCode: string;

  @Column({ type: 'jsonb' })
  filters: Record<string, any>;

  @Column({ name: 'duration_ms', type: 'int' })
  durationMs: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
