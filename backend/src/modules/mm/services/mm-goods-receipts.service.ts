import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { MmGoodsReceipt, GoodsReceiptStatus } from '../entities/mm-goods-receipt.entity';
import { MmGoodsReceiptItem } from '../entities/mm-goods-receipt-item.entity';
import { CreateGoodsReceiptDto } from '../dto/create-goods-receipt.dto';
import { ReverseGoodsReceiptDto } from '../dto/reverse-goods-receipt.dto';
import { Company } from '../../core/entities/company.entity';
import { MmVendor } from '../entities/mm-vendor.entity';
import { MmPurchaseOrder } from '../entities/mm-purchase-order.entity';
import { MmMaterial } from '../entities/mm-material.entity';
import { MmStock } from '../entities/mm-stock.entity';
import { MmPurchaseOrdersService } from './mm-purchase-orders.service';

@Injectable()
export class MmGoodsReceiptsService {
  constructor(
    @InjectRepository(MmGoodsReceipt)
    private readonly goodsReceiptsRepository: Repository<MmGoodsReceipt>,
    @InjectRepository(MmGoodsReceiptItem)
    private readonly goodsReceiptItemsRepository: Repository<MmGoodsReceiptItem>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(MmVendor)
    private readonly vendorsRepository: Repository<MmVendor>,
    @InjectRepository(MmPurchaseOrder)
    private readonly purchaseOrdersRepository: Repository<MmPurchaseOrder>,
    @InjectRepository(MmMaterial)
    private readonly materialsRepository: Repository<MmMaterial>,
    private readonly purchaseOrdersService: MmPurchaseOrdersService,
    private readonly dataSource: DataSource,
  ) {}

  private generateGrNumber(): string {
    return `GR-${Date.now()}`;
  }

  async create(dto: CreateGoodsReceiptDto): Promise<MmGoodsReceipt> {
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const vendor = dto.vendor_id
      ? await this.vendorsRepository.findOne({ where: { id: dto.vendor_id } })
      : undefined;

    const purchaseOrder = dto.purchase_order_id
      ? await this.purchaseOrdersRepository.findOne({ where: { id: dto.purchase_order_id }, relations: ['items'] })
      : undefined;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const gr = queryRunner.manager.create(MmGoodsReceipt, {
        company,
        vendor,
        purchaseOrder,
        grNumber: this.generateGrNumber(),
        postingDate: new Date(dto.posting_date),
        status: GoodsReceiptStatus.POSTED,
      });
      gr.items = [];

      for (let index = 0; index < dto.items.length; index++) {
        const itemDto = dto.items[index];
        const material = await this.materialsRepository.findOne({ where: { id: itemDto.material_id } });
        if (!material) {
          throw new NotFoundException(`Material ${itemDto.material_id} not found`);
        }

        const grItem = queryRunner.manager.create(MmGoodsReceiptItem, {
          goodsReceipt: gr,
          lineNumber: index + 1,
          material,
          quantity: itemDto.quantity,
          uom: itemDto.uom,
          storageLocationCode: itemDto.storage_location_code,
          unitPrice: itemDto.unit_price,
        });
        gr.items.push(grItem);

        let stock = await queryRunner.manager.findOne(MmStock, {
          where: {
            company: { id: dto.company_id },
            material: { id: itemDto.material_id },
            storageLocationCode: itemDto.storage_location_code,
          },
        });
        if (!stock) {
          stock = queryRunner.manager.create(MmStock, {
            company,
            material,
            storageLocationCode: itemDto.storage_location_code,
            quantity: 0,
            totalValue: 0,
            currency: dto.currency,
            lastMovementAt: new Date(dto.posting_date),
          });
        }
        stock.quantity = Number(stock.quantity) + Number(itemDto.quantity);
        stock.totalValue = Number(stock.totalValue) + Number(itemDto.quantity) * Number(itemDto.unit_price);
        stock.currency = stock.currency || dto.currency;
        stock.lastMovementAt = new Date(dto.posting_date);
        await queryRunner.manager.save(stock);

        if (purchaseOrder) {
          const poItem = itemDto.po_item_id
            ? purchaseOrder.items.find((i) => i.id === itemDto.po_item_id)
            : purchaseOrder.items.find((i) => i.material.id === material.id);
          if (poItem) {
            await this.purchaseOrdersService.updateReceivedQuantity(purchaseOrder.id, poItem.id, itemDto.quantity);
          }
        }
      }

      const saved = await queryRunner.manager.save(MmGoodsReceipt, gr);
      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async reverse(id: number, _dto: ReverseGoodsReceiptDto): Promise<MmGoodsReceipt> {
    const existing = await this.goodsReceiptsRepository.findOne({ where: { id }, relations: ['items', 'purchaseOrder', 'purchaseOrder.items', 'company'] });
    if (!existing) {
      throw new NotFoundException('Goods receipt not found');
    }
    if (existing.status !== GoodsReceiptStatus.POSTED) {
      throw new BadRequestException('Only posted goods receipts can be reversed');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      existing.status = GoodsReceiptStatus.REVERSED;

      for (const item of existing.items) {
        const stock = await queryRunner.manager.findOne(MmStock, {
          where: {
            company: { id: existing.company.id },
            material: { id: item.material.id },
            storageLocationCode: item.storageLocationCode,
          },
        });
        if (!stock) {
          throw new BadRequestException('Stock record missing for reversal');
        }
        stock.quantity = Number(stock.quantity) - Number(item.quantity);
        stock.totalValue = Number(stock.totalValue) - Number(item.quantity) * Number(item.unitPrice);
        stock.lastMovementAt = new Date();
        await queryRunner.manager.save(stock);

        if (existing.purchaseOrder) {
          const poItem = existing.purchaseOrder.items.find(
            (po) => po.material.id === item.material.id || po.lineNumber === item.lineNumber,
          );
          if (poItem) {
            await this.purchaseOrdersService.updateReceivedQuantity(existing.purchaseOrder.id, poItem.id, -Number(item.quantity));
          }
        }
      }

      const saved = await queryRunner.manager.save(existing);
      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<MmGoodsReceipt[]> {
    return this.goodsReceiptsRepository.find();
  }

  async findOne(id: number): Promise<MmGoodsReceipt> {
    const gr = await this.goodsReceiptsRepository.findOne({ where: { id } });
    if (!gr) {
      throw new NotFoundException('Goods receipt not found');
    }
    return gr;
  }
}
