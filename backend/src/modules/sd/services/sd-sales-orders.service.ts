import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SdSalesOrder, SalesOrderStatus } from '../entities/sd-sales-order.entity';
import { SdSalesOrderItem } from '../entities/sd-sales-order-item.entity';
import { SdCustomer } from '../entities/sd-customer.entity';
import { CreateSalesOrderDto } from '../dto/create-sales-order.dto';
import { SalesOrderItemDto } from '../dto/sales-order-item.dto';

@Injectable()
export class SdSalesOrdersService {
  private readonly logger = new Logger(SdSalesOrdersService.name);

  constructor(
    @InjectRepository(SdSalesOrder)
    private readonly salesOrdersRepository: Repository<SdSalesOrder>,
    @InjectRepository(SdSalesOrderItem)
    private readonly salesOrderItemsRepository: Repository<SdSalesOrderItem>,
    @InjectRepository(SdCustomer)
    private readonly customersRepository: Repository<SdCustomer>,
    private readonly dataSource: DataSource,
  ) {}

  private generateOrderNumber(): string {
    return `SO-${Date.now()}`;
  }

  async create(dto: CreateSalesOrderDto): Promise<SdSalesOrder> {
    this.logger.log('Creating sales order', {
      company_id: dto.company_id,
      customer_id: dto.customer_id,
    });

    const customer = await this.customersRepository.findOne({ where: { id: dto.customer_id } });
    if (!customer) {
      this.logger.warn(`Customer ${dto.customer_id} not found for sales order creation`);
      throw new NotFoundException('Customer not found');
    }
    if (!customer.isActive) {
      this.logger.warn(`Customer ${dto.customer_id} is inactive`);
      throw new BadRequestException('Customer is not active');
    }
    if (customer.company.id !== dto.company_id) {
      this.logger.warn('Customer company mismatch during sales order creation', {
        customer_company_id: customer.company.id,
        company_id: dto.company_id,
      });
      throw new BadRequestException('Customer does not belong to the provided company');
    }

    const items = this.buildItems(dto.items);
    const totalNetAmount = items.reduce((sum, item) => sum + Number(item.netAmount), 0);
    const totalGrossAmount = items.reduce((sum, item) => sum + Number(item.grossAmount), 0);
    this.logger.debug('Calculated sales order totals', { totalNetAmount, totalGrossAmount });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const orderNumber = this.generateOrderNumber();
      const salesOrder = queryRunner.manager.create(SdSalesOrder, {
        company: customer.company,
        customer,
        orderNumber,
        orderDate: new Date(dto.order_date),
        requestedDeliveryDate: dto.requested_delivery_date ? new Date(dto.requested_delivery_date) : null,
        currency: dto.currency,
        status: SalesOrderStatus.DRAFT,
        totalNetAmount,
        totalGrossAmount,
        items: items.map((item, index) =>
          queryRunner.manager.create(SdSalesOrderItem, {
            ...item,
            lineNumber: index + 1,
          }),
        ),
      });

      const savedOrder = await queryRunner.manager.save(salesOrder);
      await queryRunner.commitTransaction();

      this.logger.log('Sales order created', {
        company_id: dto.company_id,
        order_number: orderNumber,
        customer_id: dto.customer_id,
      });
      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to create sales order', error instanceof Error ? error.stack : undefined);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(filters?: {
    company_id?: number;
    customer_id?: number;
    status?: SalesOrderStatus;
  }): Promise<SdSalesOrder[]> {
    const where: any = {};
    if (filters?.company_id) {
      where.company = { id: filters.company_id };
    }
    if (filters?.customer_id) {
      where.customer = { id: filters.customer_id };
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    return this.salesOrdersRepository.find({ where });
  }

  async findOne(id: number): Promise<SdSalesOrder> {
    const order = await this.salesOrdersRepository.findOne({ where: { id } });
    if (!order) {
      this.logger.warn(`Sales order ${id} not found`);
      throw new NotFoundException('Sales order not found');
    }
    return order;
  }

  async updateStatus(id: number, status: SalesOrderStatus.CONFIRMED | SalesOrderStatus.CANCELLED): Promise<SdSalesOrder> {
    if (!status) {
      this.logger.warn('Status update called without status', { order_id: id });
      throw new BadRequestException('Status is required');
    }

    const order = await this.salesOrdersRepository.findOne({ where: { id }, relations: ['items'] });
    if (!order) {
      this.logger.warn(`Sales order ${id} not found for status update`);
      throw new NotFoundException('Sales order not found');
    }

    const isValidTransition =
      (order.status === SalesOrderStatus.DRAFT &&
        (status === SalesOrderStatus.CONFIRMED || status === SalesOrderStatus.CANCELLED)) ||
      (order.status === SalesOrderStatus.CONFIRMED && status === SalesOrderStatus.CANCELLED);

    if (!isValidTransition) {
      this.logger.warn('Invalid status transition attempted', {
        order_id: id,
        from: order.status,
        to: status,
      });
      throw new BadRequestException('Invalid status transition');
    }

    if (
      order.status === SalesOrderStatus.CONFIRMED &&
      status === SalesOrderStatus.CANCELLED &&
      order.items?.some((item) => Number(item.deliveredQuantity) > 0 || Number(item.invoicedQuantity) > 0)
    ) {
      this.logger.warn('Attempted to cancel delivered or invoiced order', { order_id: id });
      throw new BadRequestException('Cannot cancel an order that has deliveries or invoices');
    }

    order.status = status;
    const saved = await this.salesOrdersRepository.save(order);
    this.logger.log('Sales order status updated', { order_id: id, status });
    return saved;
  }

  private buildItems(items: SalesOrderItemDto[]): SdSalesOrderItem[] {
    return items.map((item) => {
      const discount = item.discount_percent ?? 0;
      const taxPercent = item.tax_percent ?? 0;
      const netAmount = Number(item.quantity) * Number(item.unit_price) * (1 - discount / 100);
      const taxAmount = netAmount * (taxPercent / 100);
      const grossAmount = netAmount + taxAmount;

      return this.salesOrderItemsRepository.create({
        materialId: item.material_id,
        description: item.description,
        quantity: item.quantity,
        uom: item.uom,
        unitPrice: item.unit_price,
        discountPercent: discount,
        netAmount,
        taxPercent,
        taxAmount,
        grossAmount,
        deliveredQuantity: 0,
        invoicedQuantity: 0,
      });
    });
  }
}
