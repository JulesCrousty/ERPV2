import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesController } from './companies/companies.controller';
import { CompaniesService } from './companies/companies.service';
import { CurrenciesController } from './currencies/currencies.controller';
import { CurrenciesService } from './currencies/currencies.service';
import { FiscalPeriodController } from './fiscal-period/fiscal-period.controller';
import { FiscalPeriodService } from './fiscal-period/fiscal-period.service';
import { FiscalYearController } from './fiscal-year/fiscal-year.controller';
import { FiscalYearService } from './fiscal-year/fiscal-year.service';
import { Company } from './entities/company.entity';
import { Currency } from './entities/currency.entity';
import { FiscalPeriod } from './entities/fiscal-period.entity';
import { FiscalYear } from './entities/fiscal-year.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Currency, FiscalYear, FiscalPeriod])],
  controllers: [
    CompaniesController,
    CurrenciesController,
    FiscalYearController,
    FiscalPeriodController,
  ],
  providers: [CompaniesService, CurrenciesService, FiscalYearService, FiscalPeriodService],
})
export class CoreModule {}
