import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FiPeriodControlService } from '../../../backend/src/modules/fi/services/fi-period-control.service';
import { FiPeriodControl } from '../../../backend/src/modules/fi/entities/fi-period-control.entity';
import { Company } from '../../../backend/src/modules/core/entities/company.entity';
import { FiscalYear } from '../../../backend/src/modules/core/entities/fiscal-year.entity';
import { FiscalPeriod } from '../../../backend/src/modules/core/entities/fiscal-period.entity';
import { CreateFiPeriodControlDto } from '../../../backend/src/modules/fi/dto/create-fi-period-control.dto';

describe('FiPeriodControlService (QA)', () => {
  let service: FiPeriodControlService;
  let periodControlRepository: Partial<Repository<FiPeriodControl>>;
  let companiesRepository: Partial<Repository<Company>>;
  let fiscalYearRepository: Partial<Repository<FiscalYear>>;
  let fiscalPeriodRepository: Partial<Repository<FiscalPeriod>>;

  beforeEach(() => {
    periodControlRepository = { create: jest.fn(), save: jest.fn(), find: jest.fn(), findOne: jest.fn() } as Partial<Repository<FiPeriodControl>>;
    companiesRepository = { findOne: jest.fn() } as Partial<Repository<Company>>;
    fiscalYearRepository = { findOne: jest.fn() } as Partial<Repository<FiscalYear>>;
    fiscalPeriodRepository = { findOne: jest.fn() } as Partial<Repository<FiscalPeriod>>;

    service = new FiPeriodControlService(
      periodControlRepository as Repository<FiPeriodControl>,
      companiesRepository as Repository<Company>,
      fiscalYearRepository as Repository<FiscalYear>,
      fiscalPeriodRepository as Repository<FiscalPeriod>,
    );
  });

  it('should create control when all dependencies exist', async () => {
    (companiesRepository.findOne as jest.Mock).mockResolvedValue({ id: 1 } as Company);
    (fiscalYearRepository.findOne as jest.Mock).mockResolvedValue({ id: 1 } as FiscalYear);
    (fiscalPeriodRepository.findOne as jest.Mock).mockResolvedValue({ id: 2 } as FiscalPeriod);
    (periodControlRepository.create as jest.Mock).mockReturnValue({ id: 1 });
    (periodControlRepository.save as jest.Mock).mockImplementation(async (data) => data);

    const dto: CreateFiPeriodControlDto = {
      company_id: 1,
      fiscal_year_id: 1,
      fiscal_period_id: 2,
      is_open_for_posting: true,
    };

    const created = await service.create(dto);
    expect(created).toEqual({ id: 1 });
    expect(periodControlRepository.save).toHaveBeenCalled();
  });

  it('should throw when company is missing', async () => {
    (companiesRepository.findOne as jest.Mock).mockResolvedValue(null);

    const dto: CreateFiPeriodControlDto = {
      company_id: 1,
      fiscal_year_id: 1,
      fiscal_period_id: 2,
      is_open_for_posting: true,
    };

    await expect(service.create(dto)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should detect closed periods', async () => {
    (companiesRepository.findOne as jest.Mock).mockResolvedValue({ id: 1 } as Company);
    (fiscalYearRepository.findOne as jest.Mock).mockResolvedValue({ id: 1 } as FiscalYear);
    (fiscalPeriodRepository.findOne as jest.Mock).mockResolvedValue({ id: 2 } as FiscalPeriod);
    (periodControlRepository.findOne as jest.Mock).mockResolvedValue({ isOpenForPosting: false } as FiPeriodControl);

    const isOpen = await service.isPeriodOpen(1, 2);
    expect(isOpen).toBe(false);
  });
});
