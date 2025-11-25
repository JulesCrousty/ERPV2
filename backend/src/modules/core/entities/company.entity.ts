import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('core_company')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
