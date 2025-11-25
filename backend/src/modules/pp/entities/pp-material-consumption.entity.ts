import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Company } from '../../core/entities/company.entity';
import { PpProductionOrder } from './pp-production-order.entity';
import { MmMaterial } from '../../mm/entities/mm-material.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('pp_material_consumption')
export class PpMaterialConsumption {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => PpProductionOrder, (order) => order.consumptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'production_order_id' })
  productionOrder: PpProductionOrder;

  @ManyToOne(() => MmMaterial, { eager: true })
  @JoinColumn({ name: 'material_id' })
  material: MmMaterial;

  @Column({ name: 'storage_location_code' })
  storageLocationCode: string;

  @Column({ type: 'numeric', precision: 18, scale: 3 })
  quantity: number;

  @Column()
  uom: string;

  @Column({ name: 'movement_type' })
  movementType: string;

  @Column({ name: 'posting_date', type: 'timestamp' })
  postingDate: Date;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
