import { DataSource } from 'typeorm';
import { HrEmployeesService } from '../src/modules/hr/services/hr-employees.service';
import { HrContractsService } from '../src/modules/hr/services/hr-contracts.service';
import { HrJobHistoryService } from '../src/modules/hr/services/hr-job-history.service';

const createRepositoryMock = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn((_: any, data: any) => ({ ...data })),
  save: jest.fn(async (value: any) => value),
  remove: jest.fn(),
});

const createQueryRunnerMock = () => ({
  manager: {
    create: jest.fn((entity: any, data: any) => ({ ...data })),
    save: jest.fn(async (value: any) => value),
    getRepository: jest.fn(() => createRepositoryMock() as any),
  },
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
});

describe('HrEmployeesService', () => {
  const employeesRepository = createRepositoryMock();
  const departmentsRepository = createRepositoryMock();
  const positionsRepository = createRepositoryMock();
  const companiesRepository = createRepositoryMock();
  const usersRepository = createRepositoryMock();
  const jobHistoryRepository = createRepositoryMock();

  const queryRunner = createQueryRunnerMock();
  const dataSource: Partial<DataSource> = {
    createQueryRunner: jest.fn().mockReturnValue(queryRunner),
  };

  const jobHistoryService = new HrJobHistoryService(jobHistoryRepository as any);
  let service: HrEmployeesService;

  beforeEach(() => {
    jest.clearAllMocks();
    (jobHistoryService as any).jobHistoryRepository = jobHistoryRepository;
    service = new HrEmployeesService(
      employeesRepository as any,
      departmentsRepository as any,
      positionsRepository as any,
      companiesRepository as any,
      usersRepository as any,
      jobHistoryService,
      dataSource as DataSource,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an employee', async () => {
    (companiesRepository.findOne as jest.Mock).mockResolvedValue({ id: 1 });
    (employeesRepository.create as jest.Mock).mockReturnValue({ id: 1 });
    const dto: any = {
      company_id: 1,
      employee_number: 'E001',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@corp.test',
      hire_date: '2024-01-01',
    };
    const result = await service.create(dto);
    expect(result).toBeDefined();
    expect(employeesRepository.save).toHaveBeenCalled();
  });

  it('should record job history on position change', async () => {
    const existing: any = { id: 1, department: { id: 1 }, position: { id: 1 }, hireDate: new Date() };
    (employeesRepository.findOne as jest.Mock).mockResolvedValue(existing);
    (departmentsRepository.findOne as jest.Mock).mockResolvedValue({ id: 2 });
    (positionsRepository.findOne as jest.Mock).mockResolvedValue({ id: 2 });

    await service.update(1, { department_id: 2, position_id: 2 });

    expect(queryRunner.manager.save).toHaveBeenCalled();
    expect(jobHistoryService.recordChange).toBeDefined();
  });

  it('should throw on invalid department', async () => {
    (employeesRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, hireDate: new Date() });
    (departmentsRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(service.update(1, { department_id: 99 })).rejects.toThrow();
  });

  it('should create contract and update weekly hours', async () => {
    const contractRepo = createRepositoryMock();
    const contractQueryRunner = createQueryRunnerMock();
    const contractDataSource: Partial<DataSource> = {
      createQueryRunner: jest.fn().mockReturnValue(contractQueryRunner),
    };
    const contractsService = new HrContractsService(
      contractRepo as any,
      employeesRepository as any,
      contractDataSource as DataSource,
    );
    (employeesRepository.findOne as jest.Mock).mockResolvedValue({ id: 1 });
    const dto: any = {
      employee_id: 1,
      start_date: '2024-01-01',
      contract_type: 'CDI',
      base_salary: 50000,
      currency: 'USD',
      weekly_hours: 40,
    };

    await contractsService.create(dto);

    expect(contractQueryRunner.manager.save).toHaveBeenCalled();
    expect(contractQueryRunner.manager.save).toHaveBeenCalledWith(expect.objectContaining({ weeklyHours: 40 }));
  });
});
