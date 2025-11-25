export class CreateCharacteristicDto {
  company_id: number;
  code: string;
  description: string;
  lower_limit?: number;
  upper_limit?: number;
  target_value?: number;
  uom: string;
  is_active?: boolean;
}
