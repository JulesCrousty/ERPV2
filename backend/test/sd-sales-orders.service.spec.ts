import { DataSource } from 'typeorm';
import { SdSalesOrdersService } from '../src/modules/sd/services/sd-sales-orders.service';
import { SalesOrderStatus } from '../src/modules/sd/entities/sd-sales-order.entity';

const createRepositoryMock = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('SdSalesOrdersService', () => {
  const salesOrdersRepository = createRepositoryMock();
  const salesOrderItemsRepository = createRepositoryMock();
  const customersRepository = createRepositoryMock();

  const queryRunnerMock = {
    manager: {
      create: jest.fn((_: any, data: any) => ({ ...data })),
      save: jest.fn(async (value: any) => ({ id: 1, ...value })),
    },
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  } as any;

  const dataSource: Partial<DataSource> = {
    createQueryRunner: jest.fn().mockReturnValue(queryRunnerMock),
  };

  let service: SdSalesOrdersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SdSalesOrdersService(
      salesOrdersRepository as any,
      salesOrderItemsRepository as any,
      customersRepository as any,
      dataSource as DataSource,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate totals on create', async () => {
    const customer = { id: 2, isActive: true, company: { id: 1 } } as any;
    (customersRepository.findOne as jest.Mock).mockResolvedValue(customer);
    (salesOrderItemsRepository.create as jest.Mock).mockImplementation((data: any) => ({ ...data }));

    const dto = {
      company_id: 1,
      customer_id: 2,
      order_date: '2024-01-01',
      currency: 'EUR',
      items: [
        {
          material_id: 10,
          description: 'Test item',
          quantity: 2,
          uom: 'EA',
          unit_price: 50,
          discount_percent: 10,
          tax_percent: 20,
        },
      ],
    };

    const result = await service.create(dto as any);

    expect(queryRunnerMock.manager.save).toHaveBeenCalled();
    expect(result.totalNetAmount).toBeCloseTo(90);
    expect(result.totalGrossAmount).toBeCloseTo(108);
    expect(result.status).toBe(SalesOrderStatus.DRAFT);
  });
});
