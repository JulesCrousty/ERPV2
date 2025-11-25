import { PartialType } from '@nestjs/mapped-types';
import { CreatePurchaseRequisitionDto } from './create-purchase-requisition.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePurchaseRequisitionDto extends PartialType(CreatePurchaseRequisitionDto) {
  @IsOptional()
  @IsString()
  status?: string;
}
