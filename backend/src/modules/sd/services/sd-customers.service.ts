import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../core/entities/company.entity';
import { SdCustomer } from '../entities/sd-customer.entity';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';

@Injectable()
export class SdCustomersService {
  private readonly logger = new Logger(SdCustomersService.name);

  constructor(
    @InjectRepository(SdCustomer)
    private readonly customersRepository: Repository<SdCustomer>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  async create(dto: CreateCustomerDto): Promise<SdCustomer> {
    this.logger.log('Creating customer', { company_id: dto.company_id, customer_code: dto.customer_code });

    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      this.logger.warn(`Company ${dto.company_id} not found while creating customer`);
      throw new NotFoundException('Company not found');
    }

    const existing = await this.customersRepository.findOne({
      where: { company: { id: dto.company_id }, customerCode: dto.customer_code },
    });
    if (existing) {
      this.logger.warn('Duplicate customer code detected', { company_id: dto.company_id, customer_code: dto.customer_code });
      throw new ConflictException('Customer code must be unique within company');
    }

    const customer = this.customersRepository.create({
      company,
      customerCode: dto.customer_code,
      name: dto.name,
      address: dto.address,
      city: dto.city,
      postalCode: dto.postal_code,
      country: dto.country,
      email: dto.email,
      phone: dto.phone,
      paymentTerms: dto.payment_terms,
      isActive: dto.is_active ?? true,
    });
    return this.customersRepository.save(customer);
  }

  async findAll(companyId?: number): Promise<SdCustomer[]> {
    if (companyId) {
      return this.customersRepository.find({ where: { company: { id: companyId } } });
    }
    return this.customersRepository.find();
  }

  async findOne(id: number): Promise<SdCustomer> {
    const customer = await this.customersRepository.findOne({ where: { id } });
    if (!customer) {
      this.logger.warn(`Customer ${id} not found`);
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async update(id: number, dto: UpdateCustomerDto): Promise<SdCustomer> {
    const customer = await this.findOne(id);

    if (dto.customer_code && dto.customer_code !== customer.customerCode) {
      const duplicate = await this.customersRepository.findOne({
        where: { company: { id: dto.company_id ?? customer.company.id }, customerCode: dto.customer_code },
      });
      if (duplicate) {
        this.logger.warn('Duplicate customer code detected during update', {
          company_id: dto.company_id ?? customer.company.id,
          customer_code: dto.customer_code,
        });
        throw new ConflictException('Customer code must be unique within company');
      }
    }

    if (dto.company_id && dto.company_id !== customer.company.id) {
      const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
      if (!company) {
        this.logger.warn(`Company ${dto.company_id} not found while updating customer ${id}`);
        throw new NotFoundException('Company not found');
      }
      customer.company = company;
    }

    Object.assign(customer, {
      customerCode: dto.customer_code ?? customer.customerCode,
      name: dto.name ?? customer.name,
      address: dto.address ?? customer.address,
      city: dto.city ?? customer.city,
      postalCode: dto.postal_code ?? customer.postalCode,
      country: dto.country ?? customer.country,
      email: dto.email ?? customer.email,
      phone: dto.phone ?? customer.phone,
      paymentTerms: dto.payment_terms ?? customer.paymentTerms,
      isActive: dto.is_active ?? customer.isActive,
    });

    return this.customersRepository.save(customer);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.customersRepository.remove(customer);
  }
}
