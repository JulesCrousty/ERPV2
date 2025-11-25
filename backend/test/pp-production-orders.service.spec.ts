import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PpProductionOrdersService } from '../src/modules/pp/services/pp-production-orders.service';

const createRepositoryMock = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn((_: any, data: any) => ({ ...data })),
  save: jest.fn(async (value: any) => value),
});

describe('PpProductionOrdersService', () => {
  const productionOrdersRepository = createRepositoryMock();
  const productionOrderOperationsRepository = createRepositoryMock();
  const routingsRepository = createRepositoryMock();
  const bomsRepository = createRepositoryMock();
  const materialsRepository = createRepositoryMock();
  const companiesRepository = createRepositoryMock();

  const queryRunnerMock = {
    manager: {
      create: jest.fn((_: any, data: any) => ({ ...data })),
      save: jest.fn(async (value: any) => ({ id: value.id ?? 1, ...value })),
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

  let service: PpProductionOrdersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PpProductionOrdersService(
      productionOrdersRepository as any,
      productionOrderOperationsRepository as any,
      routingsRepository as any,
      bomsRepository as any,
      materialsRepository as any,
      companiesRepository as any,
      dataSource as DataSource,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create() creates production order with operations when routing provided', async () => {
    const company = { id: 1 };
    const material = { id: 2 };
    const workCenter = { id: 3 };
    const routing = {
      id: 4,
      operations: [
        { id: 10, operationNumber: 10, workCenter, description: 'Op1', processingTimeHours: 1, sequence: 1 },
        { id: 11, operationNumber: 20, workCenter, description: 'Op2', processingTimeHours: 2, sequence: 2 },
      ],
    };

    (companiesRepository.findOne as jest.Mock).mockResolvedValue(company);
    (materialsRepository.findOne as jest.Mock).mockResolvedValue(material);
    (routingsRepository.findOne as jest.Mock).mockResolvedValue(routing);
    (productionOrdersRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, operations: [] });

    const dto = {
      company_id: 1,
      material_id: 2,
      planned_quantity: 5,
      uom: 'EA',
      routing_id: 4,
    };

    await service.create(dto as any);

    expect(queryRunnerMock.manager.save).toHaveBeenCalledTimes(1 + routing.operations.length);
    expect(productionOrdersRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['operations'] });
  });

  it('updateStatus() rejects illegal transition', async () => {
    (productionOrdersRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, status: 'PLANNED', orderNumber: 'PO-1' });

    await expect(service.updateStatus(1, { status: 'CLOSED' } as any)).rejects.toBeInstanceOf(BadRequestException);
  });
});
