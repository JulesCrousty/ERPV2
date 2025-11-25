import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Company } from '../../core/entities/company.entity';
import { FiscalPeriod } from '../../core/entities/fiscal-period.entity';
import { CreateFiDocumentDto } from '../dto/create-fi-document.dto';
import { UpdateFiDocumentDto } from '../dto/update-fi-document.dto';
import { FiAccount } from '../entities/fi-account.entity';
import { FiDocument, FiDocumentStatus } from '../entities/fi-document.entity';
import { FiDocumentLine } from '../entities/fi-document-line.entity';
import { FiPeriodControlService } from './fi-period-control.service';

@Injectable()
export class FiDocumentsService {
  constructor(
    @InjectRepository(FiDocument)
    private readonly documentsRepository: Repository<FiDocument>,
    @InjectRepository(FiDocumentLine)
    private readonly documentLinesRepository: Repository<FiDocumentLine>,
    @InjectRepository(FiAccount)
    private readonly accountsRepository: Repository<FiAccount>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(FiscalPeriod)
    private readonly fiscalPeriodsRepository: Repository<FiscalPeriod>,
    private readonly fiPeriodControlService: FiPeriodControlService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateFiDocumentDto): Promise<FiDocument> {
    if (!dto.lines || dto.lines.length < 2) {
      throw new BadRequestException('At least two lines are required');
    }

    const company = await this.companiesRepository.findOne({ where: { id: dto.company_id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const fiscalPeriod = await this.fiscalPeriodsRepository.findOne({
      where: { id: dto.fiscal_period_id },
    });
    if (!fiscalPeriod) {
      throw new NotFoundException('Fiscal period not found');
    }

    const isOpen = await this.fiPeriodControlService.isPeriodOpen(dto.company_id, dto.fiscal_period_id);
    if (!isOpen) {
      throw new BadRequestException('Posting period is closed');
    }

    const accountIds = dto.lines.map((l) => l.account_id);
    const accounts = await this.accountsRepository.findBy({ id: In(accountIds) });
    if (accounts.length !== accountIds.length) {
      throw new NotFoundException('One or more accounts not found');
    }
    const invalidAccount = accounts.find((account) => account.company.id !== company.id);
    if (invalidAccount) {
      throw new BadRequestException('All accounts must belong to the provided company');
    }
    const accountMap = new Map(accounts.map((a) => [a.id, a] as const));

    let totalDebit = 0;
    let totalCredit = 0;

    dto.lines.forEach((line, index) => {
      if ((line.debit && line.credit) || (!line.debit && !line.credit)) {
        throw new BadRequestException(`Line ${index + 1} must have either debit or credit amount`);
      }
      totalDebit += line.debit ? Number(line.debit) : 0;
      totalCredit += line.credit ? Number(line.credit) : 0;
    });

    if (totalDebit !== totalCredit) {
      throw new BadRequestException('Debit and credit must balance');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const documentNumber = `FI-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      let document = queryRunner.manager.create(FiDocument, {
        company,
        documentNumber,
        documentDate: new Date(dto.document_date),
        postingDate: new Date(dto.posting_date),
        currency: dto.currency,
        reference: dto.reference,
        fiscalPeriod,
        status: FiDocumentStatus.POSTED,
        totalDebit,
        totalCredit,
      });

      document = await queryRunner.manager.save(document);

      const lineEntities: FiDocumentLine[] = dto.lines.map((line, index) =>
        queryRunner.manager.create(FiDocumentLine, {
          document,
          lineNumber: index + 1,
          account: accountMap.get(line.account_id)!,
          debit: line.debit ?? 0,
          credit: line.credit ?? 0,
          text: line.text,
          costCenter: line.cost_center,
          profitCenter: line.profit_center,
          customerId: line.customer_id,
          vendorId: line.vendor_id,
        }),
      );

      await queryRunner.manager.save(lineEntities);

      await queryRunner.commitTransaction();
      return this.findOne(document.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  findAll(filters?: { company_id?: number; period_id?: number; status?: string }): Promise<FiDocument[]> {
    const where: any = {};
    if (filters?.company_id) {
      where.company = { id: filters.company_id };
    }
    if (filters?.period_id) {
      where.fiscalPeriod = { id: filters.period_id };
    }
    if (filters?.status) {
      where.status = filters.status as FiDocumentStatus;
    }
    return this.documentsRepository.find({ where, relations: ['lines'] });
  }

  async findOne(id: number): Promise<FiDocument> {
    const document = await this.documentsRepository.findOne({
      where: { id },
      relations: ['lines', 'lines.account', 'company', 'fiscalPeriod', 'createdBy'],
      order: { lines: { lineNumber: 'ASC' } },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  async update(id: number, dto: UpdateFiDocumentDto): Promise<FiDocument> {
    const document = await this.findOne(id);
    Object.assign(document, dto);
    return this.documentsRepository.save(document);
  }

  async reverse(id: number): Promise<FiDocument> {
    const original = await this.documentsRepository.findOne({
      where: { id },
      relations: ['lines', 'company', 'fiscalPeriod'],
    });
    if (!original) {
      throw new NotFoundException('Document not found');
    }
    if (original.status === FiDocumentStatus.REVERSED) {
      throw new BadRequestException('Document already reversed');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const reversalNumber = `REV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      let reversal = queryRunner.manager.create(FiDocument, {
        company: original.company,
        documentNumber: reversalNumber,
        documentDate: original.documentDate,
        postingDate: original.postingDate,
        currency: original.currency,
        reference: `Reversal of ${original.documentNumber}`,
        fiscalPeriod: original.fiscalPeriod,
        status: FiDocumentStatus.POSTED,
        totalDebit: original.totalCredit,
        totalCredit: original.totalDebit,
      });

      reversal = await queryRunner.manager.save(reversal);

      const reversedLines = original.lines.map((line) =>
        queryRunner.manager.create(FiDocumentLine, {
          document: reversal,
          lineNumber: line.lineNumber,
          account: line.account,
          debit: line.credit,
          credit: line.debit,
          text: line.text,
          costCenter: line.costCenter,
          profitCenter: line.profitCenter,
          customerId: line.customerId,
          vendorId: line.vendorId,
        }),
      );

      await queryRunner.manager.save(reversedLines);

      original.status = FiDocumentStatus.REVERSED;
      await queryRunner.manager.save(original);

      await queryRunner.commitTransaction();

      return this.findOne(reversal.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
