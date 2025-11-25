import { HrTimePunchesService } from '../src/modules/hr-time/services/hr-time-punches.service';
import { HrOvertimeService } from '../src/modules/hr-time/services/hr-overtime.service';
import { HrTimePunchSource, HrTimePunchType } from '../src/modules/hr-time/entities/hr-time-punch.entity';

const createRepositoryMock = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn((_: any, data: any) => ({ ...data })),
  save: jest.fn(async (value: any) => value),
});

describe('HrTimePunchesService', () => {
  const punchesRepository = createRepositoryMock();
  const employeesRepository = createRepositoryMock();
  const usersRepository = createRepositoryMock();
  const correctionsRepository = createRepositoryMock();
  const schedulesRepository = createRepositoryMock();
  const scheduleDaysRepository = createRepositoryMock();
  const overtimeService: Partial<HrOvertimeService> = {
    detectAndCreate: jest.fn(),
  };

  let service: HrTimePunchesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new HrTimePunchesService(
      punchesRepository as any,
      employeesRepository as any,
      usersRepository as any,
      correctionsRepository as any,
      schedulesRepository as any,
      scheduleDaysRepository as any,
      overtimeService as HrOvertimeService,
    );
    (employeesRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, company: { id: 1 } });
  });

  it('should punch IN', async () => {
    (punchesRepository.findOne as jest.Mock).mockResolvedValue(null);
    const dto: any = { employee_id: 1, punch_type: HrTimePunchType.IN, timestamp: '2024-01-01T08:00:00Z' };
    const result = await service.punch(dto);
    expect(result).toBeDefined();
    expect(punchesRepository.save).toHaveBeenCalled();
  });

  it('should punch OUT after IN', async () => {
    (punchesRepository.findOne as jest.Mock).mockResolvedValueOnce({ punchType: HrTimePunchType.IN });
    const dto: any = { employee_id: 1, punch_type: HrTimePunchType.OUT, timestamp: '2024-01-01T17:00:00Z' };
    const result = await service.punch(dto);
    expect(result.punchType).toBe(HrTimePunchType.OUT);
  });

  it('should reject consecutive IN', async () => {
    (punchesRepository.findOne as jest.Mock).mockResolvedValue({ punchType: HrTimePunchType.IN });
    const dto: any = { employee_id: 1, punch_type: HrTimePunchType.IN, timestamp: '2024-01-01T09:00:00Z' };
    await expect(service.punch(dto)).rejects.toThrow();
  });

  it('should reject OUT without open IN', async () => {
    (punchesRepository.findOne as jest.Mock).mockResolvedValue({ punchType: HrTimePunchType.OUT });
    const dto: any = { employee_id: 1, punch_type: HrTimePunchType.OUT, timestamp: '2024-01-01T10:00:00Z' };
    await expect(service.punch(dto)).rejects.toThrow();
  });

  it('should allow manual punch', async () => {
    (punchesRepository.findOne as jest.Mock).mockResolvedValue(null);
    (usersRepository.findOne as jest.Mock).mockResolvedValue({ id: 2 });
    const dto: any = {
      employee_id: 1,
      punch_type: HrTimePunchType.IN,
      timestamp: '2024-01-01T08:00:00Z',
      source: HrTimePunchSource.MANUAL,
      created_by: 2,
    };
    const result = await service.punch(dto);
    expect(result.source).toBe(HrTimePunchSource.MANUAL);
    expect(usersRepository.findOne).toHaveBeenCalled();
  });

  it('should calculate daily presence', async () => {
    (punchesRepository.find as jest.Mock).mockResolvedValue([
      { punchType: HrTimePunchType.IN, timestamp: new Date('2024-01-01T08:00:00Z') },
      { punchType: HrTimePunchType.BREAK_START, timestamp: new Date('2024-01-01T12:00:00Z') },
      { punchType: HrTimePunchType.BREAK_END, timestamp: new Date('2024-01-01T12:30:00Z') },
      { punchType: HrTimePunchType.OUT, timestamp: new Date('2024-01-01T17:00:00Z') },
    ]);
    (schedulesRepository.findOne as jest.Mock).mockResolvedValue({ id: 10 });
    (scheduleDaysRepository.findOne as jest.Mock).mockResolvedValue({ startTime: '08:00', endTime: '17:00', breakMinutes: 60 });

    const result = await service.calculateDailyPresence(1, new Date('2024-01-01'));
    expect(result.actualMinutes).toBe(510);
    expect(result.scheduledMinutes).toBe(480);
    expect(result.overtimeCandidateMinutes).toBe(30);
  });
});
