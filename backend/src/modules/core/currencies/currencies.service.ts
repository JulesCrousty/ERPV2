import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from '../entities/currency.entity';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';

@Injectable()
export class CurrenciesService {
  constructor(
    @InjectRepository(Currency)
    private readonly currenciesRepository: Repository<Currency>,
  ) {}

  create(createCurrencyDto: CreateCurrencyDto): Promise<Currency> {
    const currency = this.currenciesRepository.create(createCurrencyDto);
    return this.currenciesRepository.save(currency);
  }

  findAll(): Promise<Currency[]> {
    return this.currenciesRepository.find();
  }

  async findOne(id: number): Promise<Currency> {
    const currency = await this.currenciesRepository.findOne({ where: { id } });
    if (!currency) {
      throw new NotFoundException('Currency not found');
    }
    return currency;
  }

  async update(id: number, updateCurrencyDto: UpdateCurrencyDto): Promise<Currency> {
    const currency = await this.findOne(id);
    Object.assign(currency, updateCurrencyDto);
    return this.currenciesRepository.save(currency);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.currenciesRepository.delete(id);
  }
}
