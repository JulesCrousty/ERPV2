import { NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { HrEmployeesService } from '../../../backend/src/modules/hr/services/hr-employees.service';
import { HrEmployee } from '../../../backend/src/modules/hr/entities/hr-employee.entity';
import { HrDepartment } from '../../../backend/src/modules/hr/entities/hr-department.entity';
import { HrPosition } from '../../../backend/src/modules/hr/entities/hr-position.entity';
import { CreateEmployeeDto } from '../../../backend/src/modules/hr/dto/create-employee.dto';
import { Company } from '../../../backend/src/modules/core/entities/company.entity';
import { User } from '../../../backend/src/modules/auth/entities/user.entity';
import { HrJobHistoryService } from '../../../backend/src/modules/hr/services/hr-job-history.service';

describe('HrEmployeesService (QA)', () => {
  let service: HrEmployeesService;
  let employeesRepository: Partial<Repository<HrEmployee>>;
  let departmentsRepository: Partial<Repository<HrDepartment>>;
  let positionsRepository: Partial<Repository<HrPosition>>;
  let companiesRepository: Partial<Repository<Company>>;
  let usersRepository: Partial<Repository<User>>;
  let jobHistoryService: Partial<HrJobHistoryService>;
  let dataSource: Partial<DataSource>;

  beforeEach(() => {
    employeesRepository = { create: jest.fn(), save: jest.fn() } as Partial<Repository<HrEmployee>>;
    departmentsRepository = { findOne: jest.fn() } as Partial<Repository<HrDepartment>>;
    positionsRepository = { findOne: jest.fn() } as Partial<Repository<HrPosition>>;
    companiesRepository = { findOne: jest.fn() } as Partial<Repository<Company>>;
    usersRepository = { findOne: jest.fn() } as Partial<Repository<User>>;
    jobHistoryService = { logHiring: jest.fn() } as Partial<HrJobHistoryService>;
    dataSource = { createQueryRunner: jest.fn().mockReturnValue({ connect: jest.fn(), startTransaction: jest.fn(), commitTransaction: jest.fn(), rollbackTransaction: jest.fn(), release: jest.fn(), manager: { save: jest.fn(), create: jest.fn((_, data) => data) } }) } as Partial<DataSource>;

    service = new HrEmployeesService(
      employeesRepository as Repository<HrEmployee>,
      departmentsRepository as Repository<HrDepartment>,
      positionsRepository as Repository<HrPosition>,
      companiesRepository as Repository<Company>,
      usersRepository as Repository<User>,
      jobHistoryService as HrJobHistoryService,
      dataSource as DataSource,
    );
  });

  it('should throw when company not found', async () => {
    (companiesRepository.findOne as jest.Mock).mockResolvedValue(null);
    const dto = {
      employee_number: 'E1',
      company_id: 99,
      position_id: 1,
      department_id: 1,
      first_name: 'Jane',
      last_name: 'Doe',
    } as CreateEmployeeDto;

    await expect(service.create(dto)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should create employee and log hiring', async () => {
    (companiesRepository.findOne as jest.Mock).mockResolvedValue({ id: 1 } as Company);
    (positionsRepository.findOne as jest.Mock).mockResolvedValue({ id: 1 } as HrPosition);
    (departmentsRepository.findOne as jest.Mock).mockResolvedValue({ id: 2 } as HrDepartment);
    (usersRepository.findOne as jest.Mock).mockResolvedValue({ id: 10 } as User);
    (employeesRepository.create as jest.Mock).mockReturnValue({ id: 100 });
    (employeesRepository.save as jest.Mock).mockImplementation(async (data) => ({ ...data, id: 100 }));

    const dto = {
      employee_number: 'E1',
      company_id: 1,
      position_id: 1,
      department_id: 2,
      user_id: 10,
      first_name: 'Jane',
      last_name: 'Doe',
    } as CreateEmployeeDto;

    const created = await service.create(dto);
    expect(created.id).toBe(100);
    expect(jobHistoryService.logHiring).toHaveBeenCalledWith(expect.objectContaining({ id: 100 }));
  });
});
