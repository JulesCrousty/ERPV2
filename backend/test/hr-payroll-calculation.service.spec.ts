import { DataSource } from 'typeorm';
import { HrPayrollCalculationService } from '../src/modules/hr-payroll/services/hr-payroll-calculation.service';
import { HrPayrollPeriodStatus } from '../src/modules/hr-payroll/entities/hr-payroll-period.entity';
import { HrPayrollRuleCalculationType, HrPayrollRuleCategory } from '../src/modules/hr-payroll/entities/hr-payroll-rule.entity';

const createRepositoryMock = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn((_: any, data: any) => ({ ...data })),
  save: jest.fn(async (value: any) => ({ id: value.id ?? 1, ...value })),
  count: jest.fn(),
});

const createQueryRunnerMock = () => ({
  manager: {
    create: jest.fn((_: any, data: any) => ({ ...data })),
    save: jest.fn(async (value: any) => ({ id: value.id ?? Math.floor(Math.random() * 1000), ...value })),
  },
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
});

describe('HrPayrollCalculationService', () => {
  const periodRepo = createRepositoryMock();
  const ruleRepo = createRepositoryMock();
  const configRepo = createRepositoryMock();
  const inputRepo = createRepositoryMock();
  const resultRepo = createRepositoryMock();
  const resultLineRepo = createRepositoryMock();
  const employeeRepo = createRepositoryMock();
  const absenceRepo = createRepositoryMock();
  const overtimeRepo = createRepositoryMock();

  const queryRunner = createQueryRunnerMock();
  const dataSource: Partial<DataSource> = {
    createQueryRunner: jest.fn().mockReturnValue(queryRunner),
  };

  let service: HrPayrollCalculationService;

  const basePeriod = {
    id: 1,
    status: HrPayrollPeriodStatus.OPEN,
    company: { id: 1 },
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
  } as any;

  const baseEmployee = { id: 1 } as any;
  const baseConfig = { employee: baseEmployee, baseSalary: 3000, weeklyHours: 40, isTaxable: true } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new HrPayrollCalculationService(
      periodRepo as any,
      ruleRepo as any,
      configRepo as any,
      inputRepo as any,
      resultRepo as any,
      resultLineRepo as any,
      employeeRepo as any,
      absenceRepo as any,
      overtimeRepo as any,
      dataSource as DataSource,
    );

    (periodRepo.findOne as jest.Mock).mockResolvedValue(basePeriod);
    (ruleRepo.find as jest.Mock).mockResolvedValue([]);
    (employeeRepo.findOne as jest.Mock).mockResolvedValue(baseEmployee);
    (configRepo.findOne as jest.Mock).mockResolvedValue(baseConfig);
    (inputRepo.find as jest.Mock).mockResolvedValue([]);
    (absenceRepo.find as jest.Mock).mockResolvedValue([]);
    (overtimeRepo.find as jest.Mock).mockResolvedValue([]);
  });

  it('calculates base salary net', async () => {
    const result = await service.generatePayroll(1, [1]);
    expect(result[0].netSalary).toBeCloseTo(3000);
  });

  it('applies overtime rules', async () => {
    (inputRepo.find as jest.Mock).mockResolvedValue([{ type: 'OVERTIME', quantity: 10 }]);
    (ruleRepo.find as jest.Mock).mockResolvedValue([
      { id: 1, name: 'Overtime premium', category: HrPayrollRuleCategory.OVERTIME, calculationType: HrPayrollRuleCalculationType.RATE, rate: 0.01, isActive: true },
    ]);

    const result = await service.generatePayroll(1, [1]);
    expect(result[0].grossSalary).toBeGreaterThan(3000);
  });

  it('applies deductions as employee contributions', async () => {
    (ruleRepo.find as jest.Mock).mockResolvedValue([
      { id: 2, name: 'Health deduction', category: HrPayrollRuleCategory.DEDUCTION, calculationType: HrPayrollRuleCalculationType.RATE, rate: 0.1, isActive: true },
    ]);

    const result = await service.generatePayroll(1, [1]);
    expect(result[0].netSalary).toBeCloseTo(2700);
  });

  it('calculates employer contributions separately', async () => {
    (ruleRepo.find as jest.Mock).mockResolvedValue([
      { id: 3, name: 'Employer social', category: HrPayrollRuleCategory.EMPLOYER_CONTRIBUTION, calculationType: HrPayrollRuleCalculationType.RATE, rate: 0.2, isActive: true },
    ]);

    const result = await service.generatePayroll(1, [1]);
    expect(result[0].employerContributions).toBeCloseTo(600);
    expect(result[0].netSalary).toBeCloseTo(3000);
  });

  it('computes net salary with overtime and deductions', async () => {
    (inputRepo.find as jest.Mock).mockResolvedValue([{ type: 'OVERTIME', quantity: 5 }]);
    (ruleRepo.find as jest.Mock).mockResolvedValue([
      { id: 4, name: 'Overtime premium', category: HrPayrollRuleCategory.OVERTIME, calculationType: HrPayrollRuleCalculationType.RATE, rate: 0.01, isActive: true },
      { id: 5, name: 'Employee tax', category: HrPayrollRuleCategory.DEDUCTION, calculationType: HrPayrollRuleCalculationType.RATE, rate: 0.05, isActive: true },
    ]);

    const result = await service.generatePayroll(1, [1]);
    expect(result[0].netSalary).toBeGreaterThan(0);
    expect(result[0].grossSalary).toBeGreaterThan(result[0].netSalary);
  });

  it('throws when period is not open', async () => {
    (periodRepo.findOne as jest.Mock).mockResolvedValue({ ...basePeriod, status: 'CLOSED' });
    await expect(service.generatePayroll(1, [1])).rejects.toThrow();
  });
});
