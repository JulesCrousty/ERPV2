import { PartialType } from '@nestjs/mapped-types';
import { CreateFiAccountDto } from './create-fi-account.dto';

export class UpdateFiAccountDto extends PartialType(CreateFiAccountDto) {}
