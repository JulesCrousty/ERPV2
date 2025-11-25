import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MmPurchaseOrder, PurchaseOrderStatus } from '../entities/mm-purchase-order.entity';
import { MmPurchaseOrderItem } from '../entities/mm-purchase-order-item.entity';
import { CreatePurchaseOrderDto, PurchaseOrderItemDto } from '../dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from '../dto/update-purchase-order.dto';
import { Company } from '../../core/entities/company.entity';
import { MmVendor } from '../entities/mm-vendor.entity';
import { MmMaterial } from '../entities/mm-material.entity';

@Injectable()
export class MmPurchaseOrdersService {
  constructor(
    @InjectRepository(MmPurchaseOrder)
    private readonly purchaseOrdersRepository: Repository<MmPurchaseOrder>,
    @InjectRepository(MmPurchaseOrderItem)
    private readonly purchaseOrderItemsRepository: Repository<MmPurchaseOrderItem>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(MmVendor)
    private readonly vendorsRepository: Repository<MmVendor>,
    @InjectRepository(MmMaterial)
    private readonly materialsRepository: Repository<MmMaterial>,
  ) {}

  private generatePoNumber(): string {
    return `PO-${Date.now()}`;
  }

  async create(dto: CreatePurchaseOrderDto): Promise<MmPurchaseOrder> {
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const vendor = await this.vendorsRepository.findOne({ where: { id: dto.vendor_id } });
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    const items = await this.buildItems(dto.items);

    const purchaseOrder = this.purchaseOrdersRepository.create({
      company,
      vendor,
      currency: dto.currency,
      orderDate: new Date(dto.order_date),
      poNumber: this.generatePoNumber(),
      status: PurchaseOrderStatus.DRAFT,
      items,
    });
    return this.purchaseOrdersRepository.save(purchaseOrder);
  }

  async findAll(filter?: { companyId?: number; vendorId?: number; status?: PurchaseOrderStatus }): Promise<MmPurchaseOrder[]> {
    const where: any = {};
    if (filter?.companyId) {
      where.company = { id: filter.companyId };
    }
    if (filter?.vendorId) {
      where.vendor = { id: filter.vendorId };
    }
    if (filter?.status) {
      where.status = filter.status;
    }
    return this.purchaseOrdersRepository.find({ where });
  }

  async findOne(id: number): Promise<MmPurchaseOrder> {
    const order = await this.purchaseOrdersRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('Purchase order not found');
    }
    return order;
  }

  async update(id: number, dto: UpdatePurchaseOrderDto): Promise<MmPurchaseOrder> {
    const order = await this.findOne(id);

    if (dto.company_id && dto.company_id !== order.company.id) {
      const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
      if (!company) {
        throw new NotFoundException('Company not found');
      }
      order.company = company;
    }

    if (dto.vendor_id && (!order.vendor || dto.vendor_id !== order.vendor.id)) {
      const vendor = await this.vendorsRepository.findOne({ where: { id: dto.vendor_id } });
      if (!vendor) {
        throw new NotFoundException('Vendor not found');
      }
      order.vendor = vendor;
    }

    if (dto.currency) {
      order.currency = dto.currency;
    }
    if (dto.order_date) {
      order.orderDate = new Date(dto.order_date);
    }
    if (dto.status) {
      order.status = dto.status;
    }

    if (dto.items) {
      order.items = await this.buildItems(dto.items as PurchaseOrderItemDto[]);
    }

    return this.purchaseOrdersRepository.save(order);
  }

  async changeStatus(id: number, status: PurchaseOrderStatus): Promise<MmPurchaseOrder> {
    const order = await this.findOne(id);
    order.status = status;
    return this.purchaseOrdersRepository.save(order);
  }

  async updateReceivedQuantity(purchaseOrderId: number, itemId: number, quantityDelta: number): Promise<void> {
    const item = await this.purchaseOrderItemsRepository.findOne({ where: { id: itemId }, relations: ['purchaseOrder'] });
    if (!item || item.purchaseOrder.id !== purchaseOrderId) {
      throw new NotFoundException('Purchase order item not found');
    }
    item.receivedQuantity = Number(item.receivedQuantity) + quantityDelta;
    await this.purchaseOrderItemsRepository.save(item);

    const po = await this.purchaseOrdersRepository.findOne({ where: { id: purchaseOrderId } });
    if (!po) {
      return;
    }
    const items = await this.purchaseOrderItemsRepository.find({ where: { purchaseOrder: { id: purchaseOrderId } } });
    const allReceived = items.every((i) => Number(i.receivedQuantity) >= Number(i.quantity));
    const partiallyReceived = items.some((i) => Number(i.receivedQuantity) > 0 && Number(i.receivedQuantity) < Number(i.quantity));
    if (allReceived) {
      po.status = PurchaseOrderStatus.RECEIVED;
    } else if (partiallyReceived) {
      po.status = PurchaseOrderStatus.PARTIALLY_RECEIVED;
    } else if (po.status === PurchaseOrderStatus.RECEIVED || po.status === PurchaseOrderStatus.PARTIALLY_RECEIVED) {
      po.status = PurchaseOrderStatus.ORDERED;
    }
    await this.purchaseOrdersRepository.save(po);
  }

  private async buildItems(items: PurchaseOrderItemDto[]): Promise<MmPurchaseOrderItem[]> {
    const result: MmPurchaseOrderItem[] = [];
    let line = 1;
    for (const item of items) {
      const material = await this.materialsRepository.findOne({ where: { id: item.material_id } });
      if (!material) {
        throw new NotFoundException(`Material ${item.material_id} not found`);
      }
      const orderItem = this.purchaseOrderItemsRepository.create({
        lineNumber: line++,
        material,
        quantity: item.quantity,
        receivedQuantity: 0,
        uom: item.uom,
        unitPrice: item.unit_price,
        deliveryDate: item.delivery_date ? new Date(item.delivery_date) : null,
      });
      result.push(orderItem);
    }
    return result;
  }
}
