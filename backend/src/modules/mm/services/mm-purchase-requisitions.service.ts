import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MmPurchaseRequisition, PurchaseRequisitionStatus } from '../entities/mm-purchase-requisition.entity';
import { MmPurchaseRequisitionItem } from '../entities/mm-purchase-requisition-item.entity';
import { CreatePurchaseRequisitionDto, PurchaseRequisitionItemDto } from '../dto/create-purchase-requisition.dto';
import { UpdatePurchaseRequisitionDto } from '../dto/update-purchase-requisition.dto';
import { Company } from '../../core/entities/company.entity';
import { MmMaterial } from '../entities/mm-material.entity';
import { MmPurchaseOrder, PurchaseOrderStatus } from '../entities/mm-purchase-order.entity';
import { MmPurchaseOrderItem } from '../entities/mm-purchase-order-item.entity';
import { MmVendor } from '../entities/mm-vendor.entity';

@Injectable()
export class MmPurchaseRequisitionsService {
  constructor(
    @InjectRepository(MmPurchaseRequisition)
    private readonly requisitionsRepository: Repository<MmPurchaseRequisition>,
    @InjectRepository(MmPurchaseRequisitionItem)
    private readonly requisitionItemsRepository: Repository<MmPurchaseRequisitionItem>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(MmMaterial)
    private readonly materialsRepository: Repository<MmMaterial>,
    @InjectRepository(MmPurchaseOrder)
    private readonly purchaseOrdersRepository: Repository<MmPurchaseOrder>,
    @InjectRepository(MmPurchaseOrderItem)
    private readonly purchaseOrderItemsRepository: Repository<MmPurchaseOrderItem>,
    @InjectRepository(MmVendor)
    private readonly vendorsRepository: Repository<MmVendor>,
  ) {}

  private generatePrNumber(): string {
    return `PR-${Date.now()}`;
  }

  private generatePoNumber(): string {
    return `PO-${Date.now()}`;
  }

  async create(dto: CreatePurchaseRequisitionDto): Promise<MmPurchaseRequisition> {
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const items = await this.buildItems(dto.items);

    const requisition = this.requisitionsRepository.create({
      company,
      prNumber: this.generatePrNumber(),
      requestedDate: new Date(dto.requested_date),
      status: PurchaseRequisitionStatus.OPEN,
      items,
    });
    return this.requisitionsRepository.save(requisition);
  }

  async findAll(): Promise<MmPurchaseRequisition[]> {
    return this.requisitionsRepository.find();
  }

  async findOne(id: number): Promise<MmPurchaseRequisition> {
    const requisition = await this.requisitionsRepository.findOne({ where: { id } });
    if (!requisition) {
      throw new NotFoundException('Purchase requisition not found');
    }
    return requisition;
  }

  async update(id: number, dto: UpdatePurchaseRequisitionDto): Promise<MmPurchaseRequisition> {
    const requisition = await this.findOne(id);

    if (dto.company_id && dto.company_id !== requisition.company.id) {
      const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
      if (!company) {
        throw new NotFoundException('Company not found');
      }
      requisition.company = company;
    }

    if (dto.requested_date) {
      requisition.requestedDate = new Date(dto.requested_date);
    }

    if (dto.items) {
      const items = await this.buildItems(dto.items as PurchaseRequisitionItemDto[]);
      requisition.items = items.map((item, index) => ({ ...item, lineNumber: index + 1 } as any));
    }

    if (dto.status) {
      requisition.status = dto.status as PurchaseRequisitionStatus;
    }

    return this.requisitionsRepository.save(requisition);
  }

  async approve(id: number): Promise<MmPurchaseRequisition> {
    const requisition = await this.findOne(id);
    requisition.status = PurchaseRequisitionStatus.APPROVED;
    return this.requisitionsRepository.save(requisition);
  }

  async convertToPurchaseOrder(id: number, vendorId?: number, currency = 'USD'): Promise<MmPurchaseOrder> {
    const requisition = await this.findOne(id);
    const company = requisition.company;

    const vendor = vendorId
      ? await this.vendorsRepository.findOne({ where: { id: vendorId } })
      : undefined;

    const purchaseOrder = this.purchaseOrdersRepository.create({
      company,
      vendor: vendor ?? undefined,
      poNumber: this.generatePoNumber(),
      currency,
      orderDate: new Date(),
      status: PurchaseOrderStatus.DRAFT,
      items: requisition.items.map((item) =>
        this.purchaseOrderItemsRepository.create({
          lineNumber: item.lineNumber,
          material: item.material,
          quantity: item.quantity,
          uom: item.uom,
          unitPrice: 0,
          deliveryDate: item.desiredDeliveryDate ?? null,
        }),
      ),
    });

    const saved = await this.purchaseOrdersRepository.save(purchaseOrder);
    requisition.status = PurchaseRequisitionStatus.CONVERTED;
    await this.requisitionsRepository.save(requisition);
    return saved;
  }

  private async buildItems(items: PurchaseRequisitionItemDto[]): Promise<MmPurchaseRequisitionItem[]> {
    const result: MmPurchaseRequisitionItem[] = [];
    let line = 1;
    for (const item of items) {
      const material = await this.materialsRepository.findOne({ where: { id: item.material_id } });
      if (!material) {
        throw new NotFoundException(`Material ${item.material_id} not found`);
      }
      const reqItem = this.requisitionItemsRepository.create({
        lineNumber: line++,
        material,
        quantity: item.quantity,
        uom: item.uom,
        desiredDeliveryDate: item.desired_delivery_date ? new Date(item.desired_delivery_date) : null,
        note: item.note,
      });
      result.push(reqItem);
    }
    return result;
  }
}
