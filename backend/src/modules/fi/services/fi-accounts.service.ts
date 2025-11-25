import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../core/entities/company.entity';
import { CreateFiAccountDto } from '../dto/create-fi-account.dto';
import { UpdateFiAccountDto } from '../dto/update-fi-account.dto';
import { FiAccount } from '../entities/fi-account.entity';

@Injectable()
export class FiAccountsService {
  constructor(
    @InjectRepository(FiAccount)
    private readonly accountsRepository: Repository<FiAccount>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  async create(dto: CreateFiAccountDto): Promise<FiAccount> {
    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const existing = await this.accountsRepository.findOne({
      where: { company: { id: dto.company_id }, code: dto.code },
    });
    if (existing) {
      throw new BadRequestException('Account code already exists for this company');
    }

    const account = this.accountsRepository.create({
      company,
      code: dto.code,
      name: dto.name,
      type: dto.type,
      isReconAccount: dto.is_recon_account ?? false,
      isActive: dto.is_active ?? true,
    });
    return this.accountsRepository.save(account);
  }

  findAll(companyId?: number): Promise<FiAccount[]> {
    if (companyId) {
      return this.accountsRepository.find({ where: { company: { id: companyId } } });
    }
    return this.accountsRepository.find();
  }

  async findOne(id: number): Promise<FiAccount> {
    const account = await this.accountsRepository.findOne({ where: { id } });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async update(id: number, dto: UpdateFiAccountDto): Promise<FiAccount> {
    const account = await this.findOne(id);

    if (dto.code) {
      const existing = await this.accountsRepository.findOne({
        where: { company: { id: dto.company_id ?? account.company.id }, code: dto.code },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException('Account code already exists for this company');
      }
    }

    if (dto.company_id && dto.company_id !== account.company.id) {
      const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
      if (!company) {
        throw new NotFoundException('Company not found');
      }
      account.company = company;
    }

    Object.assign(account, {
      code: dto.code ?? account.code,
      name: dto.name ?? account.name,
      type: dto.type ?? account.type,
      isReconAccount: dto.is_recon_account ?? account.isReconAccount,
      isActive: dto.is_active ?? account.isActive,
    });

    return this.accountsRepository.save(account);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.accountsRepository.delete(id);
  }
}
