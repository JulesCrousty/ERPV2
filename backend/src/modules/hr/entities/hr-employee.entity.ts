import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../core/entities/company.entity';
import { User } from '../../auth/entities/user.entity';
import { HrPosition } from './hr-position.entity';
import { HrDepartment } from './hr-department.entity';

@Entity('hr_employee')
@Index(['company', 'employeeNumber'], { unique: true })
export class HrEmployee {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'employee_number' })
  employeeNumber: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ name: 'hire_date', type: 'date' })
  hireDate: Date;

  @Column({ name: 'termination_date', type: 'date', nullable: true })
  terminationDate?: Date;

  @ManyToOne(() => HrPosition, { eager: true, nullable: true })
  @JoinColumn({ name: 'position_id' })
  position?: HrPosition;

  @ManyToOne(() => HrDepartment, { eager: true, nullable: true })
  @JoinColumn({ name: 'department_id' })
  department?: HrDepartment;

  @Column({ name: 'weekly_hours', type: 'numeric', precision: 10, scale: 2, nullable: true })
  weeklyHours?: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
