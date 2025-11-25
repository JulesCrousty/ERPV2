import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { WmStorageBin } from './wm-storage-bin.entity';
import { MmMaterial } from '../../mm/entities/mm-material.entity';

@Entity('wm_bin_stock')
@Index(['bin', 'material'], { unique: true })
export class WmBinStock {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => WmStorageBin, { eager: true })
  @JoinColumn({ name: 'bin_id' })
  bin: WmStorageBin;

  @ManyToOne(() => MmMaterial, { eager: true })
  @JoinColumn({ name: 'material_id' })
  material: MmMaterial;

  @Column({ type: 'numeric', precision: 18, scale: 3, default: 0 })
  quantity: number;

  @Column()
  uom: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
