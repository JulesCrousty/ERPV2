import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PpBom } from './pp-bom.entity';
import { MmMaterial } from '../../mm/entities/mm-material.entity';

@Entity('pp_bom_item')
export class PpBomItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PpBom, (bom) => bom.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bom_id' })
  bom: PpBom;

  @ManyToOne(() => MmMaterial, { eager: true })
  @JoinColumn({ name: 'component_material_id' })
  componentMaterial: MmMaterial;

  @Column({ type: 'numeric', precision: 18, scale: 3 })
  quantity: number;

  @Column()
  uom: string;

  @Column({ name: 'scrap_percent', type: 'numeric', precision: 5, scale: 2, default: 0 })
  scrapPercent: number;
}
