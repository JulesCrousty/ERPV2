import { DataSource } from 'typeorm';
import { MmGoodsReceiptsService } from '../src/modules/mm/services/mm-goods-receipts.service';
import { MmPurchaseOrdersService } from '../src/modules/mm/services/mm-purchase-orders.service';

const createRepositoryMock = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('MmGoodsReceiptsService', () => {
  const goodsReceiptsRepository = createRepositoryMock();
  const goodsReceiptItemsRepository = createRepositoryMock();
  const companiesRepository = createRepositoryMock();
  const vendorsRepository = createRepositoryMock();
  const purchaseOrdersRepository = createRepositoryMock();
  const materialsRepository = createRepositoryMock();

  const purchaseOrdersService: Partial<MmPurchaseOrdersService> = {
    updateReceivedQuantity: jest.fn(),
  };

  const queryRunnerMock = {
    manager: {
      create: jest.fn((_: any, data: any) => ({ ...data })),
      findOne: jest.fn(),
      save: jest.fn(async (value: any) => value),
    },
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  };

  const dataSource: Partial<DataSource> = {
    createQueryRunner: jest.fn().mockReturnValue(queryRunnerMock),
  };

  let service: MmGoodsReceiptsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MmGoodsReceiptsService(
      goodsReceiptsRepository as any,
      goodsReceiptItemsRepository as any,
      companiesRepository as any,
      vendorsRepository as any,
      purchaseOrdersRepository as any,
      materialsRepository as any,
      purchaseOrdersService as MmPurchaseOrdersService,
      dataSource as DataSource,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should update stock on create', async () => {
    const company = { id: 1 };
    const material = { id: 2 };

    (companiesRepository.findOne as jest.Mock).mockResolvedValue(company);
    (vendorsRepository.findOne as jest.Mock).mockResolvedValue({ id: 3 });
    (purchaseOrdersRepository.findOne as jest.Mock).mockResolvedValue({ id: 4, items: [] });
    (materialsRepository.findOne as jest.Mock).mockResolvedValue(material);
    (queryRunnerMock.manager.findOne as jest.Mock).mockResolvedValueOnce(null);

    const dto = {
      company_id: 1,
      posting_date: '2024-01-01',
      vendor_id: 3,
      purchase_order_id: 4,
      currency: 'USD',
      items: [
        {
          material_id: 2,
          quantity: 5,
          uom: 'EA',
          storage_location_code: 'MAIN',
          unit_price: 10,
        },
      ],
    };

    await service.create(dto as any);

    expect(queryRunnerMock.manager.save).toHaveBeenCalled();
    expect(queryRunnerMock.manager.findOne).toHaveBeenCalled();
  });
});
