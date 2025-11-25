import { QmInspectionLotsService } from '../src/modules/qm/services/qm-inspection-lots.service';
import { QMStatus } from '../src/modules/qm/entities/qm-inspection-lot.entity';

const createRepositoryMock = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('QmInspectionLotsService', () => {
  const inspectionLotsRepository = createRepositoryMock();
  const companiesRepository = createRepositoryMock();
  const materialsRepository = createRepositoryMock();

  let service: QmInspectionLotsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new QmInspectionLotsService(
      inspectionLotsRepository as any,
      companiesRepository as any,
      materialsRepository as any,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an inspection lot', async () => {
    const company = { id: 1 } as any;
    const material = { id: 2 } as any;
    (companiesRepository.findOne as jest.Mock).mockResolvedValue(company);
    (materialsRepository.findOne as jest.Mock).mockResolvedValue(material);
    (inspectionLotsRepository.create as jest.Mock).mockReturnValue({ lotNumber: 'LOT-1-1', status: QMStatus.CREATED });
    (inspectionLotsRepository.save as jest.Mock).mockImplementation(async (v: any) => v);

    const result = await service.create({
      company_id: 1,
      reference_type: 'MANUAL' as any,
      material_id: 2,
      quantity: 5,
      uom: 'EA',
    });

    expect(result.status).toBe(QMStatus.CREATED);
    expect(inspectionLotsRepository.save).toHaveBeenCalled();
  });

  it('should fail on invalid status transition', async () => {
    (inspectionLotsRepository.findOne as jest.Mock).mockResolvedValue({ id: 1, status: QMStatus.CREATED });

    await expect(service.updateStatus(1, { status: QMStatus.ACCEPTED })).rejects.toThrow();
  });

  it('should allow valid status transition', async () => {
    const lot = { id: 1, status: QMStatus.CREATED, lotNumber: 'LOT-1' } as any;
    (inspectionLotsRepository.findOne as jest.Mock).mockResolvedValue(lot);
    (inspectionLotsRepository.save as jest.Mock).mockImplementation(async (v: any) => v);

    const updated = await service.updateStatus(1, { status: QMStatus.IN_PROGRESS });

    expect(updated.status).toBe(QMStatus.IN_PROGRESS);
    expect(inspectionLotsRepository.save).toHaveBeenCalled();
  });
});
