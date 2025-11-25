import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { Company } from '../../core/entities/company.entity';

@Entity('hr_overtime_rule')
@Unique(['code'])
export class HrOvertimeRule {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  code: string;

  @Column()
  description: string;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  rate: number;

  @Column({ name: 'min_minutes', type: 'int' })
  minMinutes: number;

  @Column({ name: 'max_minutes', type: 'int', nullable: true })
  maxMinutes?: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
