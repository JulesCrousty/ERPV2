import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { HrEmployee } from '../entities/hr-employee.entity';
import { HrDepartment } from '../entities/hr-department.entity';
import { HrPosition } from '../entities/hr-position.entity';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { Company } from '../../core/entities/company.entity';
import { User } from '../../auth/entities/user.entity';
import { HrJobHistoryService } from './hr-job-history.service';

@Injectable()
export class HrEmployeesService {
  private readonly logger = new Logger(HrEmployeesService.name);

  constructor(
    @InjectRepository(HrEmployee)
    private readonly employeesRepository: Repository<HrEmployee>,
    @InjectRepository(HrDepartment)
    private readonly departmentsRepository: Repository<HrDepartment>,
    @InjectRepository(HrPosition)
    private readonly positionsRepository: Repository<HrPosition>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jobHistoryService: HrJobHistoryService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateEmployeeDto): Promise<HrEmployee> {
    this.logger.log(`Creating employee ${dto.employee_number}`);
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const user = dto.user_id ? await this.usersRepository.findOne({ where: { id: dto.user_id } }) : undefined;
    const department = dto.department_id
      ? await this.departmentsRepository.findOne({ where: { id: dto.department_id } })
      : undefined;
    if (dto.department_id && !department) {
      throw new NotFoundException('Department not found');
    }
    const position = dto.position_id ? await this.positionsRepository.findOne({ where: { id: dto.position_id } }) : undefined;
    if (dto.position_id && !position) {
      throw new NotFoundException('Position not found');
    }

    const employee = this.employeesRepository.create({
      company,
      user,
      employeeNumber: dto.employee_number,
      firstName: dto.first_name,
      lastName: dto.last_name,
      email: dto.email,
      phone: dto.phone,
      hireDate: new Date(dto.hire_date),
      terminationDate: dto.termination_date ? new Date(dto.termination_date) : undefined,
      department,
      position,
      isActive: dto.is_active ?? true,
    });
    return this.employeesRepository.save(employee);
  }

  findAll(): Promise<HrEmployee[]> {
    return this.employeesRepository.find();
  }

  async findOne(id: number): Promise<HrEmployee> {
    const employee = await this.employeesRepository.findOne({ where: { id } });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
  }

  async update(id: number, dto: UpdateEmployeeDto): Promise<HrEmployee> {
    const existing = await this.findOne(id);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const department = dto.department_id
        ? await this.departmentsRepository.findOne({ where: { id: dto.department_id } })
        : existing.department;
      if (dto.department_id && !department) {
        throw new NotFoundException('Department not found');
      }
      const position = dto.position_id
        ? await this.positionsRepository.findOne({ where: { id: dto.position_id } })
        : existing.position;
      if (dto.position_id && !position) {
        throw new NotFoundException('Position not found');
      }

      const previousDepartment = existing.department;
      const previousPosition = existing.position;

      Object.assign(existing, {
        firstName: dto.first_name ?? existing.firstName,
        lastName: dto.last_name ?? existing.lastName,
        email: dto.email ?? existing.email,
        phone: dto.phone ?? existing.phone,
        hireDate: dto.hire_date ? new Date(dto.hire_date) : existing.hireDate,
        terminationDate: dto.termination_date ? new Date(dto.termination_date) : existing.terminationDate,
        department,
        position,
        isActive: dto.is_active ?? existing.isActive,
      });

      const saved = await queryRunner.manager.save(existing);

      if ((position && previousPosition?.id !== position.id) || (department && previousDepartment?.id !== department.id)) {
        await this.jobHistoryService.recordChange(
          saved,
          previousDepartment,
          previousPosition,
          department as HrDepartment,
          position as HrPosition,
          'Position or department update',
          queryRunner.manager,
        );
      }

      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    const employee = await this.findOne(id);
    this.logger.log(`Deactivating employee ${id}`);
    employee.isActive = false;
    await this.employeesRepository.save(employee);
  }
}
