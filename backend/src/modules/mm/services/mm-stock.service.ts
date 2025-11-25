import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MmStock } from '../entities/mm-stock.entity';

@Injectable()
export class MmStockService {
  constructor(
    @InjectRepository(MmStock)
    private readonly stockRepository: Repository<MmStock>,
  ) {}

  async getStock(companyId: number, materialId?: number, storageLocationCode?: string): Promise<MmStock[]> {
    const where: any = { company: { id: companyId } };
    if (materialId) {
      where.material = { id: materialId };
    }
    if (storageLocationCode) {
      where.storageLocationCode = storageLocationCode;
    }
    return this.stockRepository.find({ where });
  }
}
