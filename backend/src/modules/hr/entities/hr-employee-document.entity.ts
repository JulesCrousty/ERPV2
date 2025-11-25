import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { HrEmployee } from './hr-employee.entity';

@Entity('hr_employee_document')
export class HrEmployeeDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => HrEmployee, { eager: true })
  @JoinColumn({ name: 'employee_id' })
  employee: HrEmployee;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ name: 'document_type' })
  documentType: string;

  @Column({ name: 'uploaded_at', type: 'timestamp' })
  uploadedAt: Date;
}
