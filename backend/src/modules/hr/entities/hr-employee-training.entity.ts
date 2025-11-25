import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { HrTraining } from './hr-training.entity';
import { HrEmployee } from './hr-employee.entity';

@Entity('hr_employee_training')
export class HrEmployeeTraining {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => HrTraining, { eager: true })
  @JoinColumn({ name: 'training_id' })
  training: HrTraining;

  @ManyToOne(() => HrEmployee, { eager: true })
  @JoinColumn({ name: 'employee_id' })
  employee: HrEmployee;

  @Column({ name: 'assigned_at', type: 'timestamp' })
  assignedAt: Date;

  @Column({ name: 'completion_date', type: 'date', nullable: true })
  completionDate?: Date;
}
