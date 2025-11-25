import { Repository } from 'typeorm';
import { MmStockService } from '../../../backend/src/modules/mm/services/mm-stock.service';
import { MmStock } from '../../../backend/src/modules/mm/entities/mm-stock.entity';

describe('MmStockService (QA)', () => {
  let service: MmStockService;
  let stockRepository: Partial<Repository<MmStock>>;

  beforeEach(() => {
    stockRepository = { find: jest.fn() } as Partial<Repository<MmStock>>;
    service = new MmStockService(stockRepository as Repository<MmStock>);
  });

  it('should query stock by company and optional filters', async () => {
    (stockRepository.find as jest.Mock).mockResolvedValue([{ id: 1 }] as MmStock[]);

    const result = await service.getStock(1, 2, 'S1');
    expect(stockRepository.find).toHaveBeenCalledWith({
      where: { company: { id: 1 }, material: { id: 2 }, storageLocationCode: 'S1' },
    });
    expect(result[0].id).toBe(1);
  });
});
