import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Company } from '../core/entities/company.entity';
import { FiscalPeriod } from '../core/entities/fiscal-period.entity';
import { FiscalYear } from '../core/entities/fiscal-year.entity';
import { FiAccountsController } from './controllers/fi-accounts.controller';
import { FiDocumentsController } from './controllers/fi-documents.controller';
import { FiPeriodControlController } from './controllers/fi-period-control.controller';
import { FiAccount } from './entities/fi-account.entity';
import { FiDocument } from './entities/fi-document.entity';
import { FiDocumentLine } from './entities/fi-document-line.entity';
import { FiPeriodControl } from './entities/fi-period-control.entity';
import { FiAccountsService } from './services/fi-accounts.service';
import { FiDocumentsService } from './services/fi-documents.service';
import { FiPeriodControlService } from './services/fi-period-control.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FiAccount,
      FiDocument,
      FiDocumentLine,
      FiPeriodControl,
      Company,
      FiscalYear,
      FiscalPeriod,
      User,
    ]),
  ],
  controllers: [FiAccountsController, FiDocumentsController, FiPeriodControlController],
  providers: [FiAccountsService, FiDocumentsService, FiPeriodControlService],
})
export class FiModule {}
