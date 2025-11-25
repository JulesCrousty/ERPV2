import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HrTraining } from '../entities/hr-training.entity';
import { HrEmployeeTraining } from '../entities/hr-employee-training.entity';
import { HrEmployee } from '../entities/hr-employee.entity';
import { CreateTrainingDto } from '../dto/create-training.dto';
import { AssignTrainingDto } from '../dto/assign-training.dto';
import { Company } from '../../core/entities/company.entity';

@Injectable()
export class HrTrainingsService {
  private readonly logger = new Logger(HrTrainingsService.name);

  constructor(
    @InjectRepository(HrTraining)
    private readonly trainingsRepository: Repository<HrTraining>,
    @InjectRepository(HrEmployeeTraining)
    private readonly employeeTrainingsRepository: Repository<HrEmployeeTraining>,
    @InjectRepository(HrEmployee)
    private readonly employeesRepository: Repository<HrEmployee>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  async create(dto: CreateTrainingDto): Promise<HrTraining> {
    this.logger.log(`Creating training ${dto.code}`);
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const training = this.trainingsRepository.create({
      company,
      code: dto.code,
      name: dto.name,
      description: dto.description,
    });
    return this.trainingsRepository.save(training);
  }

  findAll(): Promise<HrTraining[]> {
    return this.trainingsRepository.find();
  }

  async assign(dto: AssignTrainingDto): Promise<HrEmployeeTraining> {
    this.logger.log(`Assigning training ${dto.training_id} to employee ${dto.employee_id}`);
    const training = await this.trainingsRepository.findOne({ where: { id: dto.training_id } });
    if (!training) {
      throw new NotFoundException('Training not found');
    }
    const employee = await this.employeesRepository.findOne({ where: { id: dto.employee_id } });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    let record = await this.employeeTrainingsRepository.findOne({
      where: { employee: { id: employee.id }, training: { id: training.id } },
    });
    if (!record) {
      record = this.employeeTrainingsRepository.create({
        employee,
        training,
        assignedAt: new Date(dto.assigned_at),
        completionDate: dto.completion_date ? new Date(dto.completion_date) : undefined,
      });
    } else {
      record.assignedAt = new Date(dto.assigned_at);
      record.completionDate = dto.completion_date ? new Date(dto.completion_date) : record.completionDate;
    }
    return this.employeeTrainingsRepository.save(record);
  }
}
