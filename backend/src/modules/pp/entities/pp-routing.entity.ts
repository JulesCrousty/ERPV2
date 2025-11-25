import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../core/entities/company.entity';
import { MmMaterial } from '../../mm/entities/mm-material.entity';
import { PpRoutingOperation } from './pp-routing-operation.entity';

@Entity('pp_routing')
@Index(['company', 'material', 'routingCode'], { unique: true })
export class PpRouting {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => MmMaterial, { eager: true })
  @JoinColumn({ name: 'material_id' })
  material: MmMaterial;

  @Column({ name: 'routing_code' })
  routingCode: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => PpRoutingOperation, (op) => op.routing, { cascade: true })
  operations: PpRoutingOperation[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
