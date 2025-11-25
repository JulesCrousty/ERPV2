import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { HrContract } from '../entities/hr-contract.entity';
import { HrEmployee } from '../entities/hr-employee.entity';
import { CreateContractDto } from '../dto/create-contract.dto';

@Injectable()
export class HrContractsService {
  private readonly logger = new Logger(HrContractsService.name);

  constructor(
    @InjectRepository(HrContract)
    private readonly contractsRepository: Repository<HrContract>,
    @InjectRepository(HrEmployee)
    private readonly employeesRepository: Repository<HrEmployee>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateContractDto): Promise<HrContract> {
    this.logger.log(`Creating contract for employee ${dto.employee_id}`);
    const employee = await this.employeesRepository.findOne({ where: { id: dto.employee_id } });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      employee.weeklyHours = dto.weekly_hours;
      await queryRunner.manager.save(employee);

      const contract = queryRunner.manager.create(HrContract, {
        employee,
        startDate: new Date(dto.start_date),
        endDate: dto.end_date ? new Date(dto.end_date) : undefined,
        contractType: dto.contract_type,
        baseSalary: dto.base_salary,
        currency: dto.currency,
        weeklyHours: dto.weekly_hours,
      });
      const saved = await queryRunner.manager.save(contract);
      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  findAll(): Promise<HrContract[]> {
    return this.contractsRepository.find();
  }
}
