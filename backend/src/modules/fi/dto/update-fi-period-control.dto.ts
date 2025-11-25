import { PartialType } from '@nestjs/mapped-types';
import { CreateFiPeriodControlDto } from './create-fi-period-control.dto';

export class UpdateFiPeriodControlDto extends PartialType(CreateFiPeriodControlDto) {}
