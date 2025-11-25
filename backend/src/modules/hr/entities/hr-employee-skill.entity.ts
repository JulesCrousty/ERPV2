import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { HrEmployee } from './hr-employee.entity';
import { HrSkill } from './hr-skill.entity';

@Entity('hr_employee_skill')
@Index(['employee', 'skill'], { unique: true })
export class HrEmployeeSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => HrEmployee, { eager: true })
  @JoinColumn({ name: 'employee_id' })
  employee: HrEmployee;

  @ManyToOne(() => HrSkill, { eager: true })
  @JoinColumn({ name: 'skill_id' })
  skill: HrSkill;

  @Column()
  level: number;

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt: Date;
}
