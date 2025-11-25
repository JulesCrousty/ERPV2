import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MmVendor } from '../entities/mm-vendor.entity';
import { CreateVendorDto } from '../dto/create-vendor.dto';
import { UpdateVendorDto } from '../dto/update-vendor.dto';
import { Company } from '../../core/entities/company.entity';

@Injectable()
export class MmVendorsService {
  constructor(
    @InjectRepository(MmVendor)
    private readonly vendorsRepository: Repository<MmVendor>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  async create(dto: CreateVendorDto): Promise<MmVendor> {
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const existing = await this.vendorsRepository.findOne({
      where: { company: { id: dto.company_id }, vendorCode: dto.vendor_code },
    });
    if (existing) {
      throw new ConflictException('Vendor code must be unique within company');
    }

    const vendor = this.vendorsRepository.create({
      company,
      vendorCode: dto.vendor_code,
      name: dto.name,
      address: dto.address,
      city: dto.city,
      country: dto.country,
      paymentTerms: dto.payment_terms,
      isActive: dto.is_active ?? true,
    });
    return this.vendorsRepository.save(vendor);
  }

  async findAll(companyId?: number): Promise<MmVendor[]> {
    if (companyId) {
      return this.vendorsRepository.find({ where: { company: { id: companyId } } });
    }
    return this.vendorsRepository.find();
  }

  async findOne(id: number): Promise<MmVendor> {
    const vendor = await this.vendorsRepository.findOne({ where: { id } });
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }
    return vendor;
  }

  async update(id: number, dto: UpdateVendorDto): Promise<MmVendor> {
    const vendor = await this.findOne(id);

    if (dto.vendor_code && dto.vendor_code !== vendor.vendorCode) {
      const existing = await this.vendorsRepository.findOne({
        where: { company: { id: dto.company_id ?? vendor.company.id }, vendorCode: dto.vendor_code },
      });
      if (existing) {
        throw new ConflictException('Vendor code must be unique within company');
      }
    }

    if (dto.company_id && dto.company_id !== vendor.company.id) {
      const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
      if (!company) {
        throw new NotFoundException('Company not found');
      }
      vendor.company = company;
    }

    Object.assign(vendor, {
      vendorCode: dto.vendor_code ?? vendor.vendorCode,
      name: dto.name ?? vendor.name,
      address: dto.address ?? vendor.address,
      city: dto.city ?? vendor.city,
      country: dto.country ?? vendor.country,
      paymentTerms: dto.payment_terms ?? vendor.paymentTerms,
      isActive: dto.is_active ?? vendor.isActive,
    });

    return this.vendorsRepository.save(vendor);
  }

  async remove(id: number): Promise<void> {
    const vendor = await this.findOne(id);
    await this.vendorsRepository.remove(vendor);
  }
}
