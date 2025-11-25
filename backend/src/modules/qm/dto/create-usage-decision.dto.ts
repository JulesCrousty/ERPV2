import { QmDecisionType } from '../entities/qm-usage-decision.entity';

export class CreateUsageDecisionDto {
  inspection_lot_id: number;
  decision: QmDecisionType;
  comments?: string;
}
