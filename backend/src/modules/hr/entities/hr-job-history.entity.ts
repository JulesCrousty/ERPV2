import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { HrEmployee } from './hr-employee.entity';
import { HrDepartment } from './hr-department.entity';
import { HrPosition } from './hr-position.entity';

@Entity('hr_job_history')
export class HrJobHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => HrEmployee, { eager: true })
  @JoinColumn({ name: 'employee_id' })
  employee: HrEmployee;

  @ManyToOne(() => HrDepartment, { eager: true, nullable: true })
  @JoinColumn({ name: 'previous_department_id' })
  previousDepartment?: HrDepartment;

  @ManyToOne(() => HrPosition, { eager: true, nullable: true })
  @JoinColumn({ name: 'previous_position_id' })
  previousPosition?: HrPosition;

  @ManyToOne(() => HrDepartment, { eager: true })
  @JoinColumn({ name: 'new_department_id' })
  newDepartment: HrDepartment;

  @ManyToOne(() => HrPosition, { eager: true })
  @JoinColumn({ name: 'new_position_id' })
  newPosition: HrPosition;

  @Column({ name: 'change_date', type: 'date' })
  changeDate: Date;

  @Column({ nullable: true })
  reason?: string;
}
