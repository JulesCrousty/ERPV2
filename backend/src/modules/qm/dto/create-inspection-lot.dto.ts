import { QmReferenceType } from '../entities/qm-inspection-lot.entity';

export class CreateInspectionLotDto {
  company_id: number;
  reference_type: QmReferenceType;
  reference_id?: number;
  material_id: number;
  quantity: number;
  uom: string;
}
