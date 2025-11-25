import { EntityManager } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HrJobHistory } from '../entities/hr-job-history.entity';
import { HrEmployee } from '../entities/hr-employee.entity';
import { HrDepartment } from '../entities/hr-department.entity';
import { HrPosition } from '../entities/hr-position.entity';

@Injectable()
export class HrJobHistoryService {
  private readonly logger = new Logger(HrJobHistoryService.name);

  constructor(
    @InjectRepository(HrJobHistory)
    private readonly jobHistoryRepository: Repository<HrJobHistory>,
  ) {}

  async recordChange(
    employee: HrEmployee,
    previousDepartment: HrDepartment | undefined,
    previousPosition: HrPosition | undefined,
    newDepartment: HrDepartment,
    newPosition: HrPosition,
    reason?: string,
    manager?: EntityManager,
  ): Promise<HrJobHistory> {
    this.logger.log(`Recording job change for employee ${employee.id}`);
    const repository = manager ? manager.getRepository(HrJobHistory) : this.jobHistoryRepository;
    const history = repository.create({
      employee,
      previousDepartment,
      previousPosition,
      newDepartment,
      newPosition,
      changeDate: new Date(),
      reason,
    });
    return repository.save(history);
  }

  findAll(): Promise<HrJobHistory[]> {
    return this.jobHistoryRepository.find();
  }
}
