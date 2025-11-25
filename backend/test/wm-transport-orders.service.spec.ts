import { DataSource } from 'typeorm';
import { WmTransportOrdersService } from '../src/modules/wm/services/wm-transport-orders.service';
import { TransportOrderStatus } from '../src/modules/wm/entities/wm-transport-order.entity';

const createRepositoryMock = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn((_: any) => _),
  save: jest.fn(async (value: any) => value),
});

describe('WmTransportOrdersService', () => {
  const transportOrdersRepository = createRepositoryMock();
  const warehouseTasksRepository = createRepositoryMock();
  const companiesRepository = createRepositoryMock();
  const materialsRepository = createRepositoryMock();
  const storageBinsRepository = createRepositoryMock();

  const queryRunnerMock = {
    manager: {
      create: jest.fn((_: any, data: any) => ({ ...data })),
      save: jest.fn(async (value: any) => ({ id: 1, ...value })),
      findOne: jest.fn(),
    },
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  };

  const dataSource: Partial<DataSource> = {
    createQueryRunner: jest.fn().mockReturnValue(queryRunnerMock as any),
  };

  let service: WmTransportOrdersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new WmTransportOrdersService(
      transportOrdersRepository as any,
      warehouseTasksRepository as any,
      companiesRepository as any,
      materialsRepository as any,
      storageBinsRepository as any,
      dataSource as DataSource,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should build transport order with tasks', async () => {
    companiesRepository.findOne.mockResolvedValue({ id: 1 });
    materialsRepository.findOne.mockResolvedValue({ id: 10 });
    storageBinsRepository.findOne.mockResolvedValue({ id: 20 });
    transportOrdersRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 1, tasks: [] });

    const dto = {
      company_id: 1,
      tasks: [
        {
          task_type: 'PUTAWAY',
          material_id: 10,
          quantity: 5,
          uom: 'EA',
          destination_bin_id: 20,
        },
      ],
    } as any;

    await service.create(dto);

    expect(queryRunnerMock.manager.save).toHaveBeenCalled();
    expect(queryRunnerMock.manager.create).toHaveBeenCalled();
    expect(transportOrdersRepository.findOne).toHaveBeenCalled();
  });

  it('should throw on illegal status transition', async () => {
    transportOrdersRepository.findOne.mockResolvedValue({ id: 1, status: TransportOrderStatus.CREATED, tasks: [] });
    await expect(
      service.updateStatus(1, { status: TransportOrderStatus.IN_PROGRESS } as any),
    ).rejects.toThrowError();
  });

  it('should allow valid status transition', async () => {
    transportOrdersRepository.findOne.mockResolvedValue({
      id: 1,
      status: TransportOrderStatus.CREATED,
      tasks: [],
      toNumber: 'TO-1',
    });

    const result = await service.updateStatus(1, { status: TransportOrderStatus.RELEASED } as any);
    expect(result.status).toEqual(TransportOrderStatus.RELEASED);
  });
});
