import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MmGoodsReceipt } from './mm-goods-receipt.entity';
import { MmMaterial } from './mm-material.entity';

@Entity('mm_goods_receipt_item')
export class MmGoodsReceiptItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => MmGoodsReceipt, (receipt) => receipt.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goods_receipt_id' })
  goodsReceipt: MmGoodsReceipt;

  @Column({ name: 'line_number' })
  lineNumber: number;

  @ManyToOne(() => MmMaterial, { eager: true })
  @JoinColumn({ name: 'material_id' })
  material: MmMaterial;

  @Column({ type: 'numeric', precision: 18, scale: 3 })
  quantity: number;

  @Column()
  uom: string;

  @Column({ name: 'storage_location_code' })
  storageLocationCode: string;

  @Column({ name: 'unit_price', type: 'numeric', precision: 18, scale: 2 })
  unitPrice: number;
}
