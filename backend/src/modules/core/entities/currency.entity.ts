import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('core_currency')
export class Currency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  label: string;
}
