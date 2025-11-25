import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateFiDocumentDto } from '../src/modules/fi/dto/create-fi-document.dto';
import { FiDocumentsService } from '../src/modules/fi/services/fi-documents.service';
import { FiPeriodControlService } from '../src/modules/fi/services/fi-period-control.service';

const createRepositoryMock = () => ({
  findOne: jest.fn(),
  findBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('FiDocumentsService', () => {
  let service: FiDocumentsService;
  const documentsRepository = createRepositoryMock();
  const documentLinesRepository = createRepositoryMock();
  const accountsRepository = createRepositoryMock();
  const companiesRepository = createRepositoryMock();
  const fiscalPeriodsRepository = createRepositoryMock();
  const fiPeriodControlService: Partial<FiPeriodControlService> = {
    isPeriodOpen: jest.fn().mockResolvedValue(true),
  };

  const queryRunnerMock = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      create: jest.fn(),
      save: jest.fn(),
    },
  };

  const dataSource: Partial<DataSource> = {
    createQueryRunner: jest.fn().mockReturnValue(queryRunnerMock),
  };

  beforeEach(() => {
    service = new FiDocumentsService(
      documentsRepository as any,
      documentLinesRepository as any,
      accountsRepository as any,
      companiesRepository as any,
      fiscalPeriodsRepository as any,
      fiPeriodControlService as FiPeriodControlService,
      dataSource as DataSource,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw when debit and credit do not balance', async () => {
    (companiesRepository.findOne as jest.Mock).mockResolvedValue({ id: 1 });
    (fiscalPeriodsRepository.findOne as jest.Mock).mockResolvedValue({ id: 1 });
    (accountsRepository.findBy as jest.Mock).mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const dto: CreateFiDocumentDto = {
      company_id: 1,
      document_date: '2024-01-01',
      posting_date: '2024-01-02',
      currency: 'EUR',
      reference: 'Test',
      fiscal_period_id: 1,
      lines: [
        { account_id: 1, debit: 100 },
        { account_id: 2, credit: 50 },
      ],
    };

    await expect(service.create(dto)).rejects.toBeInstanceOf(BadRequestException);
  });
});
