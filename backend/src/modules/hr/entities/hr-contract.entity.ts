import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { HrEmployee } from './hr-employee.entity';

export enum HrContractType {
  CDI = 'CDI',
  CDD = 'CDD',
  INTERIM = 'INTERIM',
}

@Entity('hr_contract')
export class HrContract {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => HrEmployee, { eager: true })
  @JoinColumn({ name: 'employee_id' })
  employee: HrEmployee;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date;

  @Column({ name: 'contract_type', type: 'enum', enum: HrContractType })
  contractType: HrContractType;

  @Column({ name: 'base_salary', type: 'numeric', precision: 15, scale: 2 })
  baseSalary: number;

  @Column()
  currency: string;

  @Column({ name: 'weekly_hours', type: 'numeric', precision: 10, scale: 2 })
  weeklyHours: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
